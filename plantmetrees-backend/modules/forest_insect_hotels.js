const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function insectHotelsInit(db) {
    _db = db;
}

function forestInsectHotelsGet(forestId, pagination, callback) {
    var options = {
        order: _db.order('forestId', 'ASC'),
        raw: true,
        rejectOnEmpty: true
    }

    if (pagination[0]) {
        options.limit = pagination.shift();
    }

    if (pagination[1]) {
        options.offset = pagination.shift();
    }

    if (forestId) {
        options.where = {};
        options.where.forestId = forestId;
    }

    _db.models.ForestInsectHotels.findAll(options).then(function (result) {
        callback(null, result);
    }).catch(function (err) {
        callback(err);
    });
}

function forestInsectHotelsCreate(forestId, geoTagId, callback) {
    _db.models.ForestInsectHotels.create({
        forestId,
        geoTagId
    }).then(function () {
        callback(null);
    }).catch(function (err) {
        callback(err);
    });
}

function forestInsectHotelsDelete(forestId, geoTagId) {
    let options = {
        where: {
            forestId
        }
    }

    if (geoTagId) {
        options.where.geoTagId = geoTagId;
    }

    _db.models.ForestInsectHotels.destroy(options).then(function () {
        callback(null);
    }).catch(function (err) {
        log.info(err);
    });
}

module.exports = {
    init: insectHotelsInit,
    forestInsectHotelsGet,
    forestInsectHotelsCreate,
    forestInsectHotelsDelete
}