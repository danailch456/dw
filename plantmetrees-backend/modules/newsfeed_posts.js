const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function newsfeedPostsInit(db) {
    _db = db;
}

function newsfeedPostsGet(id, pagination, perms, callback) {
    log.info(`extended perms:${perms}`);

    var options = {
        order: _db.order('id', 'ASC'),
        raw: true,
        rejectOnEmpty: true
    }

    if (pagination[0]) {
        options.limit = pagination.shift();
    }

    if (pagination[1]) {
        options.offset = pagination.shift();
    }

    if (id) {
        options.where = {};
        options.where.id = id;
    }

    if(!perms){
        if(!options.where){
            options.where = {};
        }
        options.where.status = 'visible';
    }

    _db.models.NewsfeedPosts.findAll(options).then(function (result) {
        log.info(`Enumerated newsfeed posts:${JSON.stringify(result)}`);
        return callback(null, result);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} enumerating newsfeed posts`);
        return callback(err);
    });
}

function newsfeedPostsCreate(newsfeedPost, callback) {
    _db.models.NewsfeedPosts.create(newsfeedPost).then(function () {
        log.info(`Created newsfeed post:${JSON.stringify(newsfeedPost)}`);
        return callback(null);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating newsfeed post:${JSON.stringify(newsfeedPost)}`);
        return callback(err);
    });
}

function newsfeedPostsEdit(newsfeedPost, callback) {
    _db.models.NewsfeedPosts.update(newsfeedPost,
        {
            where: {
                id: newsfeedPost.id
            },
            rejectOnEmpty: true
        }).then(function () {
            log.info(`Updated newsfeedPost values:${JSON.stringify(newsfeedPost)}`);
            return callback();
        }).catch(function (err) {
            log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
            updating newsfeedPost:${JSON.stringify(newsfeedPost)}`);
            return callback(err);
        }
        );
}

function newsfeedPostsDelete(id, callback) {
    _db.models.NewsfeedPosts.findOne({
        where: { id },
        rejectOnEmpty: true
    }).then(function (result) {
        log.info(`Deleted newsfeed post id:${id}`);
        result.destroy();
        return callback(null);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} enumerating newsfeed posts`);
        return callback(err);
    });
}

module.exports = {
    init: newsfeedPostsInit,
    newsfeedPostsGet,
    newsfeedPostsCreate,
    newsfeedPostsEdit,
    newsfeedPostsDelete
}
