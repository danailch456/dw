const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restCampaignVolunteersInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function restCampaignVolunteersCreate(req, res){
    let requestId = _rest.generateReqId();

    if (!req.params.campaignId) {
        log.error(`Missing parameter 'campaignId' for volunteering ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.campaignVolunteersCreate(req.params.campaignId, req.user.id, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restCampaignVolunteersGetVolunteers(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.campaignId) {
        log.error(`Missing parameter 'campaignId' for finding volunteers in campaign ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.campaignVolunteersGetVolunteers(req.params.campaignId, [req.query.limit,req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restCampaignVolunteersGetCampaigns(req, res){
    let requestId = _rest.generateReqId();

    if (!req.params.userId) {
        log.error(`Missing parameter 'userId' for finding campaigns, the user is volunteer at${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.campaignVolunteersGetCampaigns(req.params.userId, [req.query.limit,req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restCampaignVolunteersDeleteCampaign(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.campaignId) {
        log.error(`Missing parameter 'campaignId' for canceling own volunteership${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.campaignVolunteersDeleteCampaign(req.params.campaignId, req.user.id , function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restCampaignVolunteersDeleteUser(req, res){
    let requestId = _rest.generateReqId();

    if (!req.params.userId || !req.params.campaignId) {
        log.error(`Missing parameter 'userId' or 'campaignId' for canceling volunteership${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.hasPerms(req.user.id, {campaignId:req.params.campaignId}).then(function () {
        _handler.campaignVolunteersDeleteVolunteers(req.params.campaignId, req.params.userId, function (err) {
            if (err) {
                return _rest.error(res, requestId, err);
            } else {
                return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
            }
        }); 
    }).catch(function () {
        return _rest.error(res, requestId, {name:PermissionDenied});
    });
}

function restCampaignVolunteersGetConfig(){
    return [
        {
            method: 'post',
            resource: 'volunteer/campaign:campaignId',
            apiRestriction: 'plvol',
            handler: restCampaignVolunteersCreate
        },
        {
            method: 'get',
            resource: 'volunteer/campaign:campaignId',
            apiRestriction: 'plvol',
            handler: restCampaignVolunteersGetVolunteers
        },
        {
            method: 'get',
            resource: 'volunteer/user:userId',
            apiRestriction: 'plvol',
            handler: restCampaignVolunteersGetCampaigns
        },
        {
            method:'delete',
            resource: 'volunteer/campaign:campaignId',
            apiRestriction: 'plvol',
            handler: restCampaignVolunteersDeleteCampaign
        },
        {
            method:'delete',
            resource:'volunteers/user:userId/campaign:campaignId',
            apiRestriction: 'plass',
            handler: restCampaignVolunteersDeleteUser
        }
    ]
}

module.exports = {
    init: restCampaignVolunteersInit,
    getConfig: restCampaignVolunteersGetConfig
};