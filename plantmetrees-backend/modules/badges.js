const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function badgesInit(db) {
    _db = db;
}

function badgesGet(ownerId, type, callback){
    let options = {
        where: {
            ownerId
        },
        raw: true,
        rejectOnEmpty:true
    }

    if (type) {
        options.where.type = type;
    }

    _db.models.Badges.findAll(options).then(function (result) {
        log.info(`Badges enumerated:${JSON.stringify(result)}`);
        callback(null, result);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err},
        enumerating badges for user:${ownerId}, type:${type}`);
        return callback(err);
    });
}

function badgesGetRankings(type, pagination, callback){
    let options = {
        where: {
            type
        },
        raw: true,
        rejectOnEmpty:true
    }

    if (pagination.limit) {
        options.limit = pagination.limit;
    }

    if (pagination.offset) {
        options.offset = pagination.offset;
    }

    _db.models.Badges.findAll(options).then(function (result) {
        log.info(`Badges enumerated:${result}`);
        callback(null, result);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err},
        enumerating rankings for badge type:${type}`);
        return callback(err);
    });
}

function badgesDelete(ownerId, type, callback) {
    let options = {
        where:{
            ownerId
        },
        rejectOnEmpty: true
    }

    if (type){
        options.where.type = type;
    }

    _db.models.Badges.findOne(options).then(function (badge) {
        badge.destroy();
        log.info(`Deleted badge: owner ${ownerId}, type ${type}`);
        callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err},
        deleting badge: owner ${ownerId}, type ${type}`);
        return callback(err);
    });
}

module.exports = {
    init: badgesInit,
    badgesGet,
    badgesGetRankings,
    badgesDelete
}