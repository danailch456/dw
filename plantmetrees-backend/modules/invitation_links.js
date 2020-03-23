const logger = require('../management/logger.js');
const uuid = require('uuidv4').default;
const log = new logger().get();

let _db = null;

function invitationLinksInit(db) {
    _db = db;
}

/**
 * Module handler for finding or creating invitation links
 * @param {Number} ownerId Valid user id
 * @param {Function} callback function(err, result) On success the result parameter will contain the requested invitation link object; 
 * On error occur, 'err' param will contain info on it
 */
function invitationLinkfindOrCreate(ownerId, callback) {
    let token = uuid();
    const options = {
        where: {
            ownerId:ownerId
        },
        raw:true,
        defaults: {
            token,
            link: `http://localhost:8089/?token=${token}`
        }
    }
    _db.models.InvitationLinks.findOrCreate(options).then(function ([result, created]) {
        if (created) {
            log.info(`Created invitation link:${JSON.stringify(result)}`);
        } else {
            log.info(`Found invitation link:${JSON.stringify(result)}`);
        }
        callback(null, result);
    }).catch(function (err) {
        log.error(`Error:${err} finding/creating invitation link:
        ${(typeof err == 'object') ? err.toString() : err}`);
        callback(err);
    });
}

/**
 * Module handler for deleting invitation links
 * @param {Number} ownerId valid user id
 * @param {Function} callback function(err) ; On error occur, 'err' param will contain info on it
 */
function invitationLinkDelete(ownerId, callback) {
    const options = {
        where:{
            ownerId:ownerId
        }
    }
    _db.models.InvitationLinks.findOne(options).then(function (invitationLink) {
        invitationLink.destroy();
        log.info(`Deleted invitation link for user:${invitationLink.ownerId}`);
        callback();
    }).catch(function (err) {
        log.error(`Error:${err} deleting invitation link:
        ${(typeof err == 'object') ? err.toString() : err}`);
        callback(err); 
    });
}

module.exports = {
    init: invitationLinksInit,
    invitationLinkfindOrCreate,
    invitationLinkDelete
}