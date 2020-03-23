const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restForestInsectHotelsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function restForestInsectHotelsGet(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.forestId) {
        log.error(`Missing parameter 'forestId' for finding insect hotels in forest ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.forestInsectHotelsGet(req.params.forestId, [req.query.limit, req.query.offset] ,function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restForestInsectHotelsCreate(req, res){
    let requestId = _rest.generateReqId();

    if (!req.params.forestId) {
        log.error(`Missing parameter 'forestId' for creating insect hotel in forest ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.hasPerms(req.user.id, {forestId:req.params.forestId}).then(function () {
        _handler.forestInsectHotelsCreate(req.params.forestId, function (err) {
            if (err) {
                log.error((typeof err == 'object') ? err.toString() : err);
            } else {
                return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
            }
        });
    }).catch(function () {
        return _rest.error(res, requestId, { name: 'PermissionDenied' });
    });
}

function restForestInsectHotelsDelete(req, res){
    let requestId = _rest.generateReqId();

    if (!req.params.forestId || !req.params.geoTagId) {
        log.error(`Missing parameter 'forestId' or 'geoTagId' for deleting insect hotel ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.hasPerms(req.user.id, {forestId:req.params.forestId}).then(function () {
        _handler.forestInsectHotelsDelete(req.params.forestId, req.params.geoTagId, function (err) {
            if (err) {
                log.error((typeof err == 'object') ? err.toString() : err);
            } else {
                return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
            }
        });
    }).catch(function () {
        return _rest.error(res, requestId, { name: 'PermissionDenied' });
    });
}

function restForestInsectHotelsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'insectHotels/forest:forestId',
            apiRestriction: 'base',
            handler: restForestInsectHotelsGet
        },
        {
            method: 'post',
            resource: 'insectHotels/forest:forestId/tag:geotagId',
            apiRestriction: 'plass',
            handler: restForestInsectHotelsCreate
        },
        {
            method: 'delete',
            resource: 'insectHotels/forest:forestId/location:geoTagId?',
            apiRestriction: 'plass',
            handler: restForestInsectHotelsDelete
        }
    ]
}

module.exports = {
    init: restForestInsectHotelsInit,
    getConfig: restForestInsectHotelsGetConfig
};