const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restBadgesInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

const badgeParser = require('../objectmaps/badgeParser');

function restBadgesGet(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.userId) {
        log.error(`Missing parameter 'userId' for finding badge ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.badgesGet(req.params.userId, req.params.type, function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(
                res,
                200,
                {
                    url: req.path,
                    method: req.method
                },
                requestId,
                result.map(badge => {
                    badge.displayName = badgeParser.displayName[badge.type](badge.progress);
                    return badge;
                })
            );
        }
    });
}

function restBadgesGetRankings(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.type) {
        log.error(`Missing parameter 'type' for finding badge ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.badgesGetRankings(req.params.type, [req.query.limit, req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(
                res,
                200,
                {
                    url: req.path,
                    method: req.method
                },
                requestId,
                {
                    prefix: badgeParser.progressPrefix[req.params.type],
                    badges: result.map((badge, rank) => {
                        badge.rank = rank + 1;
                        badge.displayName = badgeParser.displayName[badge.type](badge.progress);
                        return badge;
                    })
                }

            );
        }
    });
}

function restBadgesDelete(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.userId) {
        log.error(`Missing parameter 'userId' for deleting badge ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.badgesDelete(req.params.userId, req.params.type, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restBadgesGetConfig() {
    return [
        {
            method: 'get',
            resource: 'badges/user:userId/type:type?',
            apiRestriction: 'base',
            handler: restBadgesGet//D
        },
        {
            method: 'get',
            resource: 'badges/rankings/type:type',
            apiRestriction: 'base',
            handler: restBadgesGetRankings//D
        },
        {
            method: 'delete',
            resource: 'badges/user:userId/type:type?',
            apiRestriction: 'plmgr',
            handler: restBadgesDelete//D
        }
    ]
}

module.exports = {
    init: restBadgesInit,
    getConfig: restBadgesGetConfig
};