const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function forestsInit(db) {
    _db = db;
}

function forestsGet(campaignId, pagination, callback){
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

    if (campaignId) {
        options.where = {};
        options.where.campaignId = campaignId;
    }

    _db.models.Forests.findAll(options).then(function (result) {
        log.info(`Enumerated forests:${JSON.stringify(result)}`);
        return callback(null, result);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} enumerating forests`);
        return callback(err);
    });
}

function forestsGetById(id, callback) {
    var options = {
        where:{
            id
        },
        raw: true,
        rejectOnEmpty: true
    }

    _db.models.Forests.findAll(options).then(function (result) {
        log.info(`Getting forest:${JSON.stringify(result)}`);
        return callback(null, result);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} getting forest`);
        return callback(err);
    });
}

function forestsCreate(forest, callback) {
    _db.models.Forests.create(forest).then(function () {
        log.info(`Created forest:${JSON.stringify(forest)}`);
        return callback(null);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating forest:${JSON.stringify(forest)}`);
        return callback(err);
    });
}

function forestsEdit(forest, callback) {
    _db.models.Forests.update(forest, {
        where: {
            id: forest.id
        },
        rejectOnEmpty: true
    }).then(function () {
        log.info(`Updated forest values:${JSON.stringify(forest)}`);
        return callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
            updating forest:${JSON.stringify(forest)}`);
        return callback(err);
    });
}

function forestsDelete(id, callback) {
    _db.models.Forests.findOne({
        where: {
            id
        },
        rejectOnEmpty: true
    }).then(function (result) {
        log.info(`Deleted forest id:${id}`);
        result.destroy();
        return callback(null);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} deleting forest`);
        return callback(err);
    });
}

module.exports = {
    init: forestsInit,
    forestsCreate,
    forestsGet,
    forestsGetById,
    forestsEdit,
    forestsDelete,
}