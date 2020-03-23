const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restNewsfeedPostsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function checkBodyFormat(body) {
    return !(
        !body.title ||
        !body.text
    )
}

function parseBody(body) {
    return {
        title: body.title,
        text: body.text,
        //photo: body.photo,
        status: body.status
    }
}

async function restNewsfeedPostsGet(req, res) {
    let requestId = _rest.generateReqId();

    let extendedPerms;

    if (req.user) {
        await global.GDO.hasRole(req.user.id, 'content_editor').then(function () {
            extendedPerms = true;
        }).catch(function () {
            extendedPerms = false;
        });
    } else {
        extendedPerms = false;
    }

    _handler.newsfeedPostsGet(req.params.postId, [req.query.limit, req.query.offset], extendedPerms, function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restNewsfeedPostsCreate(req, res) {
    let requestId = _rest.generateReqId();

    if (!checkBodyFormat(req.body)) {
        log.error(`Body for creating post request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, { name: 'InvalidBodyFormat' });
    }

    let postObject = parseBody(req.body);
    postObject.postedBy = req.user.id;

    if (postObject.status) {//prevent writer from posting in the newsfeed without editor validation
        delete postObject.status
    }

    _handler.newsfeedPostsCreate(postObject, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restNewsfeedPostsEdit(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.postId) {
        log.error(`Missing parameter 'postId' for editing post${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    let updateObject = parseBody(req.body);
    updateObject.id = req.params.postId;
    updateObject.editedBy = req.user.id;

    _handler.newsfeedPostsEdit(updateObject, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restNewsfeedPostsDelete(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.postId) {
        log.error(`Missing parameter 'postId' for deleting post${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.newsfeedPostsDelete(req.params.postId, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restNewsfeedPostsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'newsfeed/post:postId?',
            apiRestriction: null,
            handler: restNewsfeedPostsGet//D
        },
        {
            method: 'post',
            resource: 'newsfeed',
            apiRestriction: 'cntrtr',
            handler: restNewsfeedPostsCreate//D
        },
        {
            method: 'put',
            resource: 'newsfeed/post:postId',
            apiRestriction: 'cntedtr',
            handler: restNewsfeedPostsEdit//D
        },
        {
            method: 'delete',
            resource: 'newsfeed/post:postId',
            apiRestriction: 'cntedtr',
            handler: restNewsfeedPostsDelete//D
        },
    ]
}

module.exports = {
    init: restNewsfeedPostsInit,
    getConfig: restNewsfeedPostsGetConfig
};