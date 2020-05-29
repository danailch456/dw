const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function campaignVolunteersInit(db) {
    _db = db;
}

function campaignVolunteersGetVolunteers(campaignId, pagination, callback) {
    var options = {
        order: _db.order('id', 'ASC'),
        where: {
            campaignId
        },
        raw: true,
        rejectOnEmpty: true
    }

    if (pagination[0]) {
        options.limit = pagination.shift();
    }

    if (pagination[1]) {
        options.offset = pagination.shift();
    }

    _db.models.CampaignVolunteers.findAll(options).then(function (volunteers) {
        let promises = [];

        volunteers.forEach(volunteer => {
            promises.push(new Promise(function (resolve, reject) {
                resolve(volunteer.userId);
            }));
        });

        Promise.all(promises).then(function (volunteersUserIds) {
            callback(null,{campaignId,volunteers:volunteersUserIds})
        }).catch(function (err) {
           log.error(err);
           callback(err);
        });
    });
}

function campaignVolunteersGetCampaigns(userId, pagination, callback) {
    var options = {
        order: _db.order('id', 'ASC'),
        where: {
            userId
        },
        raw: true,
        rejectOnEmpty: true
    }

    if (pagination[0]) {
        options.limit = pagination.shift();
    }

    if (pagination[1]) {
        options.offset = pagination.shift();
    }

    _db.models.CampaignVolunteers.findAll(options).then(function (campaigns) {
        let promises = [];

        campaigns.forEach(campaign => {
            promises.push(new Promise(function (resolve, reject) {
                resolve(campaign.campaignId);
            }));
        });

        Promise.all(promises).then(function (campaignIds) {
            callback(null,{userId,campaigns:campaignIds})
        }).catch(function (err) {
           log.error(err);
           callback(err);
        });
    });
}

function campaignVolunteersCreate(campaignId, userId) {
    let campaignVolunteer = {campaignId, userId};

    _db.models.CampaignVolunteers.create(campaignVolunteer).then(function () {
        log.info(`Created campaign volunteer:${JSON.stringify(campaignVolunteer)}`);
        return callback(null);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating campaign volunteer:${JSON.stringify(campaignVolunteer)}`);
        return callback(err);
    });
}

function campaignVolunteersDelete(campaignId,userId, callback) {
    _db.models.CampaignVolunteers.findOne({
        where: {
            campaignId,
            userId
        },
        rejectOnEmpty: true
    }).then(function (result) {
        log.info(`Deleted campaign volunteer id:${id}`);
        result.destroy();
        return callback(null);
    }).catch(function (err) {
        log.error(`Error: ${(typeof err == 'object') ? err.toString() : err} deleting campaign volunteers`);
        return callback(err);
    });
}

module.exports = {
    init: campaignVolunteersInit,
    campaignVolunteersGetVolunteers,
    campaignVolunteersCreate,
    campaignVolunteersGetCampaigns,
    campaignVolunteersDelete
}