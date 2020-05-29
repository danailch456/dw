const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function polygonsInit(db) {
    _db = db;
}

function polygonsGet(forestId, pagination, callback) {
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

    if (forestId) {
        options.where = {};
        options.where.forestId = forestId;
    }

    _db.models.Polygons.findAll(options).then(function (result) {
        log.info(JSON.stringify(result));

        callback(null, result);

    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
        enumerating polygons`);
        return callback(err);
    });
}

function polygonsCreate(forestId, cordinates, callback) {
    let polygon = {
        forestId,
        data: cordinates
    };
    _db.models.Polygons.create(polygon).then(function (polygonDb) {
        log.info(`Created polygon:${JSON.stringify(polygonDb)}`);
        return callback(null);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating polygon:${JSON.stringify(polygon)}`);
        return callback(err);
    });
}

function polygonsDelete(forestId, callback) {
    _db.models.Polygons.findOne({
        where: {
            forestId
        },
        rejectOnEmpty: true
    }).then(function (polygon) {
        polygon.destroy();
        log.info(`Deleted polygon with forestId:${forestId}`);
        return callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err},
            deleting polygon with forestId:${forestId}`);
        return callback(err);
    });
}

module.exports = {
    init: polygonsInit,
    polygonsGet,
    polygonsCreate,
    polygonsDelete
}