const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restCampaignsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function checkBodyFormat(body) {
    return !(!body.name ||
        !body.description ||
        !body.totalEuroCost)
}

function parseBody(body) {
    return {
        name: body.name,
        description: body.description,
        totalEuroCost: body.totalEuroCost,
        totalEuroFounded: body.totalEuroFounded,
        transactionData: body.transactionData,
        managerId: body.managerId
    }
}

function restCampaignsCreate(req, res) {
    let requestId = _rest.generateReqId();

    if (!checkBodyFormat(req.body)) {
        log.error(`Body for creating campaign request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, { name: 'InvalidBodyFormat' });
    }

    let campaignObject = parseBody(req.body);
    delete campaignObject.managerId;
    campaignObject.managerId = req.user.id;

    _handler.campaignsCreate(campaignObject, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restCampaignsGet(req, res) {
    let requestId = _rest.generateReqId();

    _handler.campaignsGet(req.params.campaignId, [req.query.limit, req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restCampaignsEdit(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.campaignId) {
        log.error(`Missing parameter 'campaignId' for editing campaign ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.hasPerms(req.user.id, {campaignId:req.params.campaignId}).then(function () {
        let updateObject = parseBody(req.body);
        updateObject.id = req.params.campaignId;

        _handler.campaignsEdit(updateObject, function (err) {
            if (err) {
                log.error((typeof err == 'object') ? err.toString() : err);
            } else {
                return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
            }
        });
    }).catch(function () {
        return _rest.error(res, requestId, { name: 'PermissionDenied' });
    });
}

function restCampaignsDelete(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.campaignId) {
        log.error(`Missing parameter 'campaignId' for deleting campaign ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.hasPerms(req.user.id, {campaignId:req.params.campaignId}).then(function () {
        _handler.campaignsDelete(req.params.campaignId, function (err) {
            if (err) {
                log.error((typeof err == 'object') ? err.toString() : err);
            } else {
                return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
            }
        });
    }).catch(function () {
        return _rest.error(res, requestId, { name: 'PermissionDenied' });
    });
}

function restCampaignsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'campaigns/:campaignId?',
            apiRestriction: 'base',
            handler: restCampaignsGet//D
        },
        {
            method: 'post',
            resource: 'campaigns',
            apiRestriction: 'plass',
            handler: restCampaignsCreate//D
        },
        {
            method: 'put',
            resource: 'campaigns/:campaignId',
            apiRestriction: 'plass',
            handler: restCampaignsEdit
        },
        {
            method: 'delete',
            resource: 'campaigns/:campaignId',
            apiRestriction: 'plass',
            handler: restCampaignsDelete//D
        },
    ]
}

module.exports = {
    init: restCampaignsInit,
    getConfig: restCampaignsGetConfig
};