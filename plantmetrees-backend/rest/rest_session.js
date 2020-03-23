const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restAuthInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function logout(req,res) {
    let requestId = _rest.generateReqId();

    req.logout();
    _rest.response(res, 200, {url:req.path, method:req.method}, requestId);
}

function session(req, res) {
    let requestId = _rest.generateReqId();

    _rest.response(res, 200, {url:req.path, method:req.method}, requestId);
}

function restAuthGetConfig() {
    return [
        {
            method: 'post',
            resource: 'session/local',
            apiRestriction: 'local',
            handler: session//D
        },
        {
            method: 'get',
            resource: 'session/google',
            apiRestriction:'google',
            handler: session//D
        },
        {
            method: 'get',
            resource: 'session/google/callback',
            apiRestriction:'gglclbk',
            handler: session//D
        },
        {
            method: 'get',
            resource: 'session/facebook',
            apiRestriction: 'facebook',
            handler: session//D
        },
        {
            method: 'get',
            resource: 'session/facebook/callback',
            apiRestriction:'fbclbk',
            handler: session//D
        },
        {
            method:'delete',
            resource: 'session',
            handler:logout//D
        }
    ];
}

module.exports = {
    init: restAuthInit,
    getConfig: restAuthGetConfig
};