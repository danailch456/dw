const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restUsersInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function checkBodyFormatLocal(body) {
    return (body.email != null &&
        body.password != null)
}

function parseBody(body) {
    return {
        email: body.email,
        localPassHash: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        geoLocation: body.geoLocation,
        addressCountry: body.addressCountry,
        addressCity: body.addressCity,
        addressInfo: body.addressInfo,
        lastLogin: body.lastLogin
    }
}

function restUserSignupLocal(req, res) {
    let requestId = _rest.generateReqId();

    if (!checkBodyFormatLocal(req.body)) {
        log.error(`Body for local signup request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, { name: 'InvalidBodyFormat' });
    }

    let userObj = parseBody(req.body);

    _handler.userCreate(userObj, function (err, user) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            global.GDO.resolveInvitationLink(req.query.token);
            req.login(user, function (err) {
                if (err) {
                    log.error((typeof err == 'object') ? err.toString() : err);
                } else {
                    return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
                }
            });
        }
    });
}

function restUsersGet(req, res) {

    let requestId = _rest.generateReqId();

    _handler.usersGetPublicData(req.params.id, [req.query.limit, req.query.offset], (req.params.id == req.user.id), function (err, users) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, users);
        }
    });
}

function restUserGet(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.id) {
        log.error(`Missing parameter 'id' for finding user ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    global.GDO.findUsers({
        id: req.params.id
    }).then(function (user) {
        delete user.localPassHash;
        return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, user);
    }).catch(function (err) {
        log.error((typeof err == 'object') ? err.toString() : err);
        return _rest.error(res, requestId, err);
    });
}

function restUsersQuery(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.query.email) {
        log.error(`Missing 'email' query parameter for finding user ${JSON.stringify(req.query)}`);
        return _rest.error(res, requestId, { name: 'MissingQueryParameter' });
    }

    global.GDO.findUsers({
        email: req.query.email
    }).then(function (user) {
        delete user.localPassHash;
        return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, user);
    }).catch(function (err) {
        log.error((typeof err == 'object') ? err.toString() : err);
        return _rest.error(res, requestId, err);
    });
}


function restUserEdit(req, res) {
    let requestId = _rest.generateReqId();

    let updateObject = parseBody(req.body);
    updateObject.id = req.user.id;

    _handler.userEdit(updateObject, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restUserBlock(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.id) {
        log.error(`Missing parameter 'id' for blocking user ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    } 
    
    if(req.params.id == 1){
        log.error(`Can't block the deffault platform admin`);
        return _rest.error(res, requestId, { name: 'PermissionDenied' });
    }

    _handler.userBlock(req.params.id, req.query.status, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restUserDelete(req, res) {
    let requestId = _rest.generateReqId();

    if(req.params.id == 1){
        log.error(`Can't delete the deffault platform admin`);
        return _rest.error(res, requestId, { name: 'PermissionDenied' });
    }

    _handler.userDelete(req.user.id, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            req.logout();
            _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restUsersGetConfig() {
    return [
        {
            method: 'post',
            resource: 'users',
            handler: restUserSignupLocal//D
        },
        {
            method: 'get',
            resource: 'users/:id?',
            apiRestriction: 'base',
            handler: restUsersGet//D
        },
        {
            method: 'get',
            resource: 'user/:id',
            apiRestriction: 'plmgr',
            handler: restUserGet//D
        },
        {
            method: 'get',
            resource: 'user',
            apiRestriction: 'plmgr',
            handler: restUsersQuery//D
        },
        {
            method: 'put',
            resource: 'user',
            apiRestriction: 'base',
            handler: restUserEdit //D
        },
        {
            method: 'put',
            resource: 'user/:id',
            apiRestriction: 'plmgr',
            handler: restUserBlock//D
        },
        {
            method: 'delete',
            resource: 'user',
            apiRestriction: 'base',
            handler: restUserDelete//D
        }
    ];
}

module.exports = {
    init: restUsersInit,
    getConfig: restUsersGetConfig
};