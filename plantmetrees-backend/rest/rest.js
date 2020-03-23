/* Init the logger module */
const logger = require('../management/logger.js');
const log = new logger().get();

/* Init the node modules */

const path = require('path');
const express = require('express');
const session = require('express-session');
const yml = require('js-yaml');
const fs = require('fs');
const uuid = require('uuidv4').default;
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const http = require('http');
const getSuccessMsg = require('../objectmaps/success_msg_map');
const getError = require('../objectmaps/error_map');


/* Define the config files from manifest */
const configFiles = require('../_config_manifest.json');

/* Load the config files */
const properties = yml.safeLoad(fs.readFileSync(
    `${configFiles.common_props_file}`,
    'utf8'
));
const config = yml.safeLoad(fs.readFileSync(
    `${configFiles.config_file}`,
    'utf8'
));

let _authMgmt = null;

let _expressApp = null;
let _handlerModules = null;
let _restMap = {};

let _httpServer;
let _listeningPort;

function generateReqId() {
    let requestId = uuid();
    return requestId;
}

function bodyError(res, requestId, error) {
    ({ status, error_msg } = getError(error.name));

    return res.status(status).json({
        request_id: requestId,
        error_msg
    }).end();
}

function bodyResponse(res, status, reqData, requestId, payload) {
    let response = {
        request_id: requestId,
        success_msg: getSuccessMsg(reqData.url, reqData.method),
    }
    if (payload) {
        response.payload = payload;
    }
    return res.status(status).json(response).end();
}

/**
* Returns the clientId of the corresponding application
* @param {String} appName 
*/
function getAppId(appName) {
    return properties.oauth20[appName].client_id;
}

let _commonRest = {
    generateReqId,
    response: bodyResponse,
    error: bodyError,
    getAppId
}

function restInit(modulesList) {
    log.info('[REST] :: Initializing...');
    _handlerModules = modulesList;

    _expressApp = express();
    _expressApp.use(morgan('tiny'));
    _expressApp.use(bodyParser.urlencoded({
        extended: true
    }));
    _expressApp.use(bodyParser.json());
    _expressApp.use(session(config.auth.session)); /* Express session handler */

    _expressApp.use(_authMgmt.initPassport()); /* Passport init */
    _expressApp.use(_authMgmt.sessionPassport()); /* Persistent login sessions */

    /* Preset the authentication strategies to be used with passport*/
    _authMgmt.passportUse(_authMgmt.localStrategy());
    _authMgmt.passportUse(_authMgmt.googleStrategy());
    _authMgmt.passportUse(_authMgmt.facebookStrategy());

    _authMgmt.presetUserRialization();

    _expressApp.use(methodOverride());
    /* Preset 'Last-Modified' header in order to ignore etag cache for rest endpoint */
    _expressApp.get('/rest*', function (req, res, next) {
        res.setHeader('Last-Modified', (new Date()).toUTCString());
        next();
    });

    /* Serve static */
    _expressApp.use(express.static(path.join(`${__dirname}`, `${properties.static.root}`)));
    _expressApp.get('/', function (req, res) {
        res.sendFile(path.join(`${__dirname}`, `${properties.static.index}`));
    });

    _httpServer = http.createServer(_expressApp);

    for (let mdl in _handlerModules) {
        log.info(`[REST] :: Loading REST module: ${mdl}`);
        _restMap[mdl] = require(`./rest_${mdl}`);
    }
}

function restRegister() {
    for (let moduleKey in _restMap) {
        let restModule = _restMap[moduleKey];

        /* Init the rest with its module handler */
        restModule.init(_commonRest, _handlerModules[moduleKey]);

        let restConfig = restModule.getConfig();
        for (let idx in restConfig) {
            let conf = restConfig[idx];

            const restPrefix = properties.endpoints.rest;
            let resourceUrl = `/${restPrefix}/${conf.resource}`;

            log.info(`[REST] :: Configuring REST: ${JSON.stringify(conf)}`);

            _authMgmt.getApiRestrictionMidleware(conf.apiRestriction).then(function (authMidleware) {
                _expressApp[conf.method](resourceUrl, authMidleware, conf.handler);
            }).catch(function () {
                _expressApp[conf.method](resourceUrl, conf.handler);
            });
        }
    }
}

function restListen(listenPort) {

    _listeningPort = listenPort;
    _httpServer.listen(_listeningPort, function () {
        log.info(`[REST] :: Listening at port: ${_listeningPort}`)
    });

}

module.exports = function (authMgmt) {
    _authMgmt = authMgmt;

    return {
        init: restInit,
        register: restRegister,
        listen: restListen
    }

}