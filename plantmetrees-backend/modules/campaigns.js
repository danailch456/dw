const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function campaignsInit(db) {
    _db = db;
}

function campaignsGet(id, pagination, callback){
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

    _db.models.Campaigns.findAll(options).then(function (result) {
        log.info(`Enumerated campaigns:${JSON.stringify(result)}`);
        return callback(null, result);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} enumerating campaigns`);
        return callback(err);
    });
}

function campaignsCreate(campaign, callback) {
    _db.models.Campaigns.create(campaign).then(function () {
        log.info(`Created campaign:${JSON.stringify(campaign)}`);
        return callback(null);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating campaign:${JSON.stringify(campaign)}`);
        return callback(err);
    });
}

function campaignsEdit(campaign, callback) {
    _db.models.Campaigns.update(campaign, {
        where: {
            id: campaign.id
        },
        rejectOnEmpty: true
    }).then(function () {
        log.info(`Updated campaign values:${JSON.stringify(campaign)}`);
        return callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
            updating campaign:${JSON.stringify(campaign)}`);
        return callback(err);
    });
}

function campaignsDelete(id, callback) {
    _db.models.Campaigns.findOne({
        where: {
            id
        },
        rejectOnEmpty: true
    }).then(function (result) {
        log.info(`Deleted campaign id:${id}`);
        result.destroy();
        return callback(null);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} deleting campaigns`);
        return callback(err);
    });
}

module.exports = {
    init: campaignsInit,
    campaignsCreate,
    campaignsGet,
    campaignsEdit,
    campaignsDelete,
}