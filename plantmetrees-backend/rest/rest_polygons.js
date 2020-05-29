const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restPolygonsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function restPolygonsGet(req, res){
    let requestId = _rest.generateReqId();
    
    _handler.polygonsGet(req.params.forestId, [req.query.limit, req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restPolygonsCreate(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.forestId) {
        log.error(`Missing parameter 'forestId' for creating polygon ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    if(!req.body.cordinates){
        log.error(`Body for creating post request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, { name: 'InvalidBodyFormat' });
    }

    _handler.polygonsCreate(req.params.forestId, req.body.cordinates, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restPolygonsDelete(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.forestId) {
        log.error(`Missing parameter 'forestId' for creating polygon ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.polygonsDelete(req.params.forestId, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restPolygonsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'polygons/forest:forestId?',
            apiRestriction: null,
            handler: restPolygonsGet
        },
        {
            method: 'post',
            resource: 'polygons/forest:forestId',
            apiRestriction: 'plass',
            handler: restPolygonsCreate
        },
        {
            method: 'delete',
            resource: 'polygons/forest:forestId',
            apiRestriction: 'plass',
            handler: restPolygonsDelete
        }
    ]
}

module.exports = {
    init: restPolygonsInit,
    getConfig: restPolygonsGetConfig
}