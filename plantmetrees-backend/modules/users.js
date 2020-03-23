const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function usersInit(db) {
    _db = db;
}

/**
 * Moodule handler for creating user
 * @param {Object} user format validated user object 
 * @param {function} callback function(err, created) ; On error occur, 'err' param will contain info on it
 */
function userCreate(user, callback) {
    user.userType = 'local';
    _db.models.Users.create(user).then(function (userDb) {
        log.info(`Created user:${JSON.stringify(userDb)}`);
        return callback(null, userDb);
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err} creating user:${JSON.stringify(user)}`);
        return callback(err);
    });
}

/**
 * Module handler for getting user/users
 * @param {String} id if filled , the function will search for user with this specific id 
 * @param {Array} pagination Array containing 2 elements, limit and offset in that order
 * @param {Boolean} self If true private data won't be filtered when sending the payload back
 * @param {function} callback function(err, result); If id parameter is not specified, 
 * result will be set to an array of objects containing the users; If id parameter is specified, 
 * result will return an array of objects containing a single object with the user; 
 * In case of an error, result will be set to null 
 * and err parameter will be set to indicate the error
 */
function usersGetPublicData(id, pagination, self, callback) {
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

    _db.models.Users.findAll(options).then(function (result) {
        log.info(JSON.stringify(result));
        if (self) {
            delete result.localPassHash;
            callback(null, result);
        } else {
            return callback(null, result.map(
                function (user) {
                    return {
                        id: user.id,
                        email: user.email
                    }
                })
            );
        }
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
        enumerating users`);
        return callback(err);
    });
}

/**
 * Module handler for editing user
 * @param {Object} user Object containing id property and new values for all fields that will be changed
 * @param {function} callback function(err); 'err' parameter will be set to indicate if an error occures
 */
function userEdit(user, callback) {
    _db.models.Users.update(user,
        {
            where: {
                id: user.id
            },
            rejectOnEmpty: true
        }).then(function () {
            log.info(`Updated user values:${user}`);
            return callback();
        }).catch(function (err) {
            log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
            updating user:${JSON.stringify(user)}`);
            return callback(err);
        }
    );
}

function userBlock(id, status = 'inactive', callback) {
    _db.models.Users.update({status:status},
        {
            where: {
                id
            },
            rejectOnEmpty: true
        }).then(function () {
            return callback();
        }).catch(function (err) {
            log.error(`Error:${(typeof err == 'object') ? err.toString() : err}, 
            block user:${JSON.stringify(id)}`);
            return callback(err);
        }
    );
}

/**
 * Module handler for deleting user
 * @param {String} id id of the user to be deleted
 * @param {function} callback function(err); 'err' parameter will be set to indicate if an error occures
 */
function userDelete(id, callback) {
    _db.models.Users.findOne({
        where: {
            id: id
        },
        rejectOnEmpty: true
    }).then(function (user) {
        user.destroy();
        log.info(`Deleted user with id:${id}`);
        return callback();
    }).catch(function (err) {
        log.error(`Error:${(typeof err == 'object') ? err.toString() : err},
        deleting user with id:${id}`);
        return callback(err);
    });
}

module.exports = {
    init: usersInit,
    userCreate,
    usersGetPublicData,
    userEdit,
    userDelete,
    userBlock
}