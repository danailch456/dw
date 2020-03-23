const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function geoTagsInit(db) {
    _db = db;
}

/**
 * Module handler for creating geo tag
 * @param {Object} geoTag format validated, geo tag object
 * @param {Function} callback function(err) ; On error occur, 'err' param will contain info on it
 */
function geoTagCreate(geoTag ,callback) {
    _db.models.GeoTags.create(geoTag).then(function (geoTagDb) {
        log.info(`Created geo tag${JSON.stringify(geoTagDb)}`);
        callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating geo tag:${JSON.stringify(geoTag)}`);
        callback(err); 
    });
}


/**
 * Module handler for getting geo tags
 * @param {String} tagType valid tag type;
 * Can be:
 * - forest
 * - insect_hotel
 * @param {Function} callback function(err, result) On success the result parameter will contain the requested geo tags; 
 * On error occur, 'err' param will contain info on it
 */
function geoTagsGet(tagType, callback) {
    let options = {
        where: {},
        rejectOnEmpty: true,
        raw: true
    }

    if(tagType){
        options.where.tagType = tagType;
    }

    _db.models.GeoTags.findAll(options).then(function (result) {
        log.info(JSON.stringify(result));
        if (result.length == 1) {
            return callback(null, result[0]);
        } else {
            return callback(result);
        }
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
        enumerating geo tag`);
        return callback(err);
    });
}

/**
 * Module handler for editing geo tags
 * @param {Object} geoTag format validated, geo tag object
 * @param {Function} callback function(err) ; On error occur, 'err' param will contain info on it
 */
function geoTagEdit(id, geoTag, callback) {
    const options = {
        where:{
            id
        },
        rejectOnEmpty:true
    }

    _db.models.GeoTags.update(geoTag,options).then(function () {
        log.info(`Updated geo tag with id:${id}, values:${JSON.stringify(geoTag)}`);
        callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
        updating geo tag:${JSON.stringify(geoTag)}`);
        return callback(err); 
    });
}

/**
 * Module handler for deleting geo tags
 * @param {Number} id Valid geo tag id
 * @param {Function} callback function(err) ; On error occur, 'err' param will contain info on it
 */
function geoTagDelete(id, callback) {
    const options = {
        where: {
            id: id
        },
        rejectOnEmpty: true
    };
    _db.models.GeoTags.findOne(options).then(function (geoTag) {
        geoTag.destroy();
        log.info(`Deleted geo tag with id:${id}`);
        return callback();
    }).catch(function (err) {
        log.error(`Error:${JSON.stringify(err)},
        deleting geo tag with id:${id}`);
        return callback(err);
    });
}

module.exports = {
    init: geoTagsInit,
    geoTagCreate,
    geoTagsGet,
    geoTagEdit,
    geoTagDelete
}