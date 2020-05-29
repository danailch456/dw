/* Init the logger module */
const logger = require('../management/logger.js');
const log = new logger().get();

sha3_256 = require('js-sha3').sha3_256;

/**
 * Executed before searching for users;
 * Encrypts the incoming plaintext password before the search takes place;
 * @param {Object} options The sequelize options, passed to '<model>.find'
 */
function userBeforeFind(options) {
    try {
        if (options.where.localPassHash) {
            options.where.localPassHash = sha3_256(options.where.localPassHash);
            log.info(options.where.localPassHash);
        }
    } catch (error) {
        log.error(`Error:${(typeof error == 'object') ? JSON.stringify(error) : error.toString()}`);
    }
}

/**
 * Executed before saving user;
 * Encrypts the incoming plaintext password before storing it into the database;
 * @param {Object} instance The sequelize object of the user
 * @param {Object} options The options given to the save operation
*/
function userBeforeSave(instance, options) {
    try {
        if (instance.localPassHash) {
            instance.localPassHash = sha3_256(instance.localPassHash);
        }
    } catch (error) {
        log.error(`Error:${(typeof error == 'object') ? JSON.stringify(error) : error.toString()}`);    
    }
}

/**
 * Executed after creating user;
 * Creates community badge for the user;
 * @param {Object} instance The sequelize object of the user
 * @param {Object} options The options given to the create operation
 */
function userAfterCreate(instance, options) {
    log.info(`Creating a community badge for user ${instance.dataValues.id}`);
    global.GDO.trackBadge(instance.dataValues.id, 'community');
}

/**
 * Executed after creating role assignment;
 * Creates a badge for the user according to the role recieved;
 * @param {Object} instance The sequelize object of the user
 * @param {Object} options The options given to the create operation
 */
function roleAssignmentsAfterCreate(instance, options) {
    if (instance.dataValues.role == 'planter_supporter') {
        log.info(`Creating a suppoter badge for user ${instance.dataValues.grantedTo}`);
        global.GDO.trackBadge(instance.dataValues.grantedTo, 'supporter');
    } else if (instance.dataValues.role == 'planter_associate') {
        log.info(`Creating a organizer badge for user ${instance.dataValues.grantedTo}`);
        global.GDO.trackBadge(instance.dataValues.grantedTo, 'organizer');
    }
}

/**
 * Generates new identity hash and stores it in the database every time the geo tag changes one of the following fields:
 * - latitude
 * - longitude
 * - datetime
 * @param {Object} instance The sequelize object of the geo tag
 * @param {Object} options The options given to the save operation
 */
function geoTagBeforeSave(instance, options) {
    log.info(`Gnerating identity hash for geotag`);
    if (instance._changed.latitude || instance._changed.longitude || instance._changed.datetime) {
        instance.dataValues.identityHash = sha3_256(`${instance.dataValues.latitude};${instance.dataValues.longitude};${instance.dataValues.datetime}`);
    }
}

/**
 * @todo Generates the link apon creation
 * @param {Object} instance The sequelize object of the invitation link
 * @param {Object} options The options given to the create operation
 */
function invitationLinksBeforeCreate(instance, options) {
    instance.dataValues.link = ``;
}

function forestsAfterSave(instance, options) {
    log.info()
    if (instance._changed.state && instance.dataValues.state == 'successfuly_planted') {
        global.GDO.trackBadge(
            global.GDO.getForestManager(instance.dataValues.id),
            'organizer',
            instance.dataValues.estimateTrees
        )
    }
}

function transactionsAfterCreate(instance, options) {
    global.GDO.trackBadge(
        instance.dataValues.userId,
        'supporter',
        instance.dataValues.euro
    )
}

function invitationLinksAfterSave(instance, options) {
    if (instance._changed.peopleInvited) {
        global.GDO.trackBadge(instance.dataValues.ownerId,'community');
    }
}

module.exports = {
    User: {
        beforeFind: userBeforeFind,
        beforeSave: userBeforeSave,
        afterCreate: userAfterCreate
    },
    GeoTags: {
        beforeSave: geoTagBeforeSave,
        beforeUpdate: geoTagBeforeSave
    },
    InvitationLinks: {
        //beforeCreate: invitationLinksBeforeCreate,
        afterSave: invitationLinksAfterSave,
        afterUpdate: invitationLinksAfterSave
    },
    roleAssignments: {
        afterCreate: roleAssignmentsAfterCreate
    },
    Forests: {
        afterSave: forestsAfterSave
    },
    Transactions: {
        afterCreate: transactionsAfterCreate
    }
}