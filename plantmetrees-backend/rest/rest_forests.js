const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restForestsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function checkBodyFormat(body) {
    return !(
        !body.forestName ||
        !body.estimateTrees ||
        !body.campaignId
    )
}

function parseBody(body) {
    return {
        forestName: body.forestName,
        forestState: body.forestState,
        forestRegion: body.forestRegion,
        estimateTrees: body.estimateTrees,
        area: body.area,
        campaignId: body.campaignId
    }
}

function restForestsGet(req, res) {
    let requestId = _rest.generateReqId();

    _handler.forestsGet(req.params.campaignId, [req.query.limit, req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restForestsCreate(req, res) {
    let requestId = _rest.generateReqId();

    if (!checkBodyFormat(req.body)) {
        log.error(`Body for creating forest request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, { name: 'InvalidBodyFormat' });
    }

    global.GDO.hasPerms(req.user.id, { campaignId: req.body.campaignId }).then(function () {
        let forestObj = parseBody(req.body);

        _handler.forestsCreate(forestObj, function (err) {
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

function restForestsEdit(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.id) {
        log.error(`Missing parameter 'id' for editing forest ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.hasPerms(req.user.id, { forestId: req.params.id }).then(function () {
        let forestObj = parseBody(req.body);

        _handler.forestsCreate(forestObj, function (err) {
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

function restForestsDelete(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.id) {
        log.error(`Missing parameter 'id' for deleting forest ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.hasPerms(req.user.id, { forestId: req.params.id }).then(function () {
        _handler.forestsCreate(forestObj, function (err) {
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

function restForestsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'forests/campaign:campaignId?',
            apiRestriction: 'base',
            handler: restForestsGet
        },
        {
            method: 'post',
            resource: 'forests',
            apiRestriction: 'plass',
            handler: restForestsCreate
        },
        {
            method: 'put',
            resource: 'forests/:id',
            apiRestriction: 'plass',
            handler: restForestsEdit
        },
        {
            method: 'delete',
            resource: 'forests/:id',
            apiRestriction: 'plass',
            handler: restForestsDelete
        }
    ]
}

module.exports = {
    init: restForestsInit,
    getConfig: restForestsGetConfig
};