const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function newsfeedLikesInit(db) {
    _db = db;
}

function newsfeedLikesGetForPost(postId, pagination, callback) {
    var options = {
        where: {
            '$NewsfeedPosts.status$': 'visible'
        },
        order: _db.order('newsfeedPostId', 'ASC'),
        raw: true,
        rejectOnEmpty: true,
        include: [
            {
                model: _db.models.NewsfeedPosts,
                required: false
            }
        ]
    }

    if (pagination[0]) {
        options.limit = pagination.shift();
    }

    if (pagination[1]) {
        options.offset = pagination.shift();
    }

    if (postId) {
        options.where.newsfeedPostId = postId;
    }

    _db.models.NewsfeedLikes.findAll(options).then(function (result) {
        log.info(`Enumerated newsfeed likes:${result.toString()}`);
        return callback(null, result);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} enumerating newsfeed likes`);
        return callback(err);
    });
}

function newsfeedLikesGetForUser(userId, pagination, callback) {
    var options = {
        where: {
            '$NewsfeedPosts.status$': 'visible'
        },
        order: _db.order('newsfeedPostId', 'ASC'),
        raw: true,
        rejectOnEmpty: true,
        include: [
            {
                model: _db.models.NewsfeedPosts,
                required: false
            }
        ]
    }

    if (pagination[0]) {
        options.limit = pagination.shift();
    }

    if (pagination[1]) {
        options.offset = pagination.shift();
    }

    if (userId) {
        options.where.userId = userId;
    }

    _db.models.NewsfeedLikes.findAll(options).then(function (result) {
        log.info(`Enumerated newsfeed likes:${result.toString()}`);
        return callback(null, result);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} enumerating newsfeed likes`);
        return callback(err);
    });
}

function newsfeedLikesCreate(userId, newsfeedPostId, callback) {
    _db.models.NewsfeedPosts.findAll({
        where: {
            id: userId,
            status: 'visible'
        },
        raw: true,
        rejectOnEmpty: true
    }).then(function () {
        _db.models.NewsfeedLikes.create({ userId, newsfeedPostId }).then(function () {
            log.info(`User ${userId} liked post ${newsfeedPostId}`);
            return callback(null);
        }).catch(function (err) {
            log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} creating newsfeed likes`);
            return callback(err);
        });
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err}finding newsfeed post${newsfeedPostId}`);
        return callback(err);
    });
}

function newsfeedLikesDelete(userId, newsfeedPostId, callback) {
    _db.models.NewsfeedLikes.findOne({
        where: {
            userId,
            newsfeedPostId,
            status: 'visible'
        },
        rejectOnEmpty: true
    }).then(function (result) {
        result.destroy();
        log.info(`User ${userId} unliked post ${newsfeedPostId}`);
        return callback(null, result);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} enumerating newsfeed likes`);
        return callback(err);
    });
}

module.exports = {
    init: newsfeedLikesInit,
    newsfeedLikesGetForPost,
    newsfeedLikesGetForUser,
    newsfeedLikesCreate,
    newsfeedLikesDelete
}