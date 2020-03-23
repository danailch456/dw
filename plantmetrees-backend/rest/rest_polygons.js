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

}

function restPolygonsDelete(req, res) {
    let requestId = _rest.generateReqId();

}

function restPolygonsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'polygons/forest:forestId?',
            apiRestriction: 'base',
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
            resource: 'polygons',
            apiRestriction: 'plass',
            handler: restPolygonsDelete
        }
    ]
}

module.exports = {
    init: restPolygonsInit,
    getConfig: restPolygonsGetConfig
}