const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function roleAssignmentsInit(db) {
    _db = db;
}

/**
 * Module handler for creating role assignment
 * @param {Object} roleAssignment format validated, role assignment object
 * @param {function} callback function(err) ; On error occur, 'err' param will contain info on it
 */
function assignRole(roleAssignment, callback) {
    _db.models.RoleAssignments.create(roleAssignment).then(function (roleAssignmentDb) {
        log.info(`Created role assignment${roleAssignmentDb}`);
        callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating role assignment:${JSON.stringify(roleAssignment)}`);
        callback(err);
    });
}

/**
 * Module handler for searching role assignments
 * @param {Number} grantedTo A valid user id;
 * will be passed to the search options if != null;
 * @param {Number} grantedBy A valid user id;
 * will be passed to the search options if != null;
 * @param {String} role A valid role; 
 * will be passed to the search options if != null;
 * Can be:  
 - platform_admin
 - platform_manager
 - content_editor
 - content_writer
 - merch_manager
 - planter_associate
 - planter_volunteer
 - planter_suporter
 * @param {Function} callback function(err, result) On success the result parameter will contain the requested geo tags; 
 * On error occur, 'err' param will contain info on it
 */
function getRoleAssignments(grantedTo, grantedBy, role, callback) {
    let options = {
        where: {},
        rejectOnEmpty: true,
        raw: true
    }

    if (grantedTo) {
        options.where.grantedTo = grantedTo;
    }
    if (grantedBy) {
        options.where.grantedBy = grantedBy;
    }
    if (role) {
        options.where.role = role;
    }

    _db.models.RoleAssignments.findAll(options).then(function (result) {
        log.info(JSON.stringify(result));
        if (result.length == 1) {
            return callback(null, result[0]);
        } else {
            return callback(result);
        }
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
        enumerating role assignments`);
        return callback(err);
    });
}


/**
 * Module handler for deleting role assignments
 * @param {Number} grantedTo A valid user id;
 * will be passed to the search options if != null; 
 * @param {String} role A valid role; 
 * will be passed to the search options if != null;
 * Can be:  
 - platform_admin
 - platform_manager
 - content_editor
 - content_writer
 - merch_manager
 - planter_associate
 - planter_volunteer
 - planter_suporter 
 * @param {Function} callback function(err) ; On error occur, 'err' param will contain info on it
 */
function deleteRoleAssignments(grantedTo, role, callback) {
    let options = {
        where: {},
        rejectOnEmpty: true
    }

    if (grantedTo) {
        options.where.grantedTo = grantedTo;
    }
    if (role) {
        options.where.role = role;
    }

    _db.models.RoleAssignments.findAll(options).then(function (roleAssignments_db) {
        log.info(JSON.stringify(roleAssignments_db));
        let promises = [];
        roleAssignments_db.forEach(function (role) {
            promises.push(new Promise(function (resolve,reject) {
                role.destroy();
                log.info(`Deleted role assignmnet with id:${role.id}`);
                resolve();
            }));
        });

        Promise.all(promises).then(function () {
           return callback(null) 
        }).catch(function (err) {
            log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
            deleting role assignments`);
            return callback(err);
        });
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
        deleting role assignments`);
        return callback(err);
    });
}

module.exports = {
    init: roleAssignmentsInit,
    roleAssignmentsCreate: assignRole,
    roleAssignmentsGet: getRoleAssignments,
    roleAssignmentsDelete: deleteRoleAssignments
}