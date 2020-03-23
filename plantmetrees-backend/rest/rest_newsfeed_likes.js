const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restNewsfeedLikesInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function restNewsfeedLikesGetForPost(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.postId) {
        log.error(`Missing parameter 'postId' for finding likes for post${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.newsfeedLikesGetForPost(req.params.postId, [req.query.limit, req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restNewsfeedLikesGetForUser(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.userId) {
        log.error(`Missing parameter 'userId' for finding posts liked by user${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.newsfeedLikesGetForUser(req.params.userId, [req.query.limit, req.query.offset], function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restNewsfeedLikesCreate(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.postId) {
        log.error(`Missing parameter 'postId' for liking post${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.newsfeedLikesCreate(req.user.id, req.params.postId, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restNewsfeedLikesDelete(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.postId) {
        log.error(`Missing parameter 'postId' for deleting post${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.newsfeedLikesDelete(req.user.id, req.params.postId, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restNewsfeedLikesGetConfig() {
    return [
        {
            method: 'get',
            resource: 'newsfeed/likes/post:postId',
            apiRestriction: null,
            handler: restNewsfeedLikesGetForPost//D
        },
        {
            method: 'get',
            resource: 'newsfeed/likes/user:userId',
            apiRestriction: 'base',
            handler: restNewsfeedLikesGetForUser//D
        },
        {
            method: 'post',
            resource: 'newsfeed/likes/post:postId',
            apiRestriction: 'base',
            handler: restNewsfeedLikesCreate//D
        },
        {
            method: 'delete',
            resource: 'newsfeed/likes/post:postId',
            apiRestriction: 'base',
            handler: restNewsfeedLikesDelete//D
        },
    ]
}

module.exports = {
    init: restNewsfeedLikesInit,
    getConfig: restNewsfeedLikesGetConfig
};