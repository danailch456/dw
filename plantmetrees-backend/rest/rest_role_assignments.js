const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restRoleAssignmentsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function checkBodyFormat(body) {
    return (body.role != null &&
        body.grantedTo != null)
}

function parseBody(body) {
    return {
        role: body.role,
        grantedTo: body.grantedTo,
        remark: body.remark
    }
}

function restRoleAssignmentsCreate(req, res) {
    let requestId = _rest.generateReqId();
    
    if (!checkBodyFormat(req.body)) {
        log.error(`Body for assigning role request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, { name: 'InvalidBodyFormat' });
    }

    let roleAssignmentObject = parseBody(req.body);
    roleAssignmentObject.grantedBy = req.user.id;


    _handler.roleAssignmentsCreate(roleAssignmentObject, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restRoleAssignmentsGet(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.grantedTo || !req.params.role) {
        log.error(`Missing parameter 'grantedTo' or 'role' for finding role assignment ${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.roleAssignmentsGet(req.params.grantedTo, null, req.params.role, function (err, role) {
        if (!err) {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, { hasRole: true });
        } else if (err.name == 'SequelizeEmptyResultError') {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, { hasRole: false });
        } else {
            return _rest.error(res, requestId, err);
        }
    });
}

function restRoleAssignmentsQuery(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.query.grantedTo && !req.query.grantedBy) {
        log.error(`Missing 'grantedTo' or 'grantedBy' query parameter for finding role assignment ${JSON.stringify(req.query)}`);
        return _rest.error(res, requestId, { name: 'MissingQueryParameter' });
    }

    _handler.roleAssignmentsGet(req.query.grantedTo, req.query.grantedBy, null, function (err, roleAssignments) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, roleAssignments);
        }
    });
}

function restRoleAssignmentsDelete(req, res) {
    let requestId = _rest.generateReqId();

    if (!req.params.grantedTo) {
        log.error(`Missing parameter 'grantedTo' for deleting role assignment${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    _handler.roleAssignmentsDelete(req.params.grantedTo, req.params.role, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restRoleAssignmentsGetConfig() {
    return [
        {
            method: 'post',
            resource: 'role/assign',
            apiRestriction: 'plmgr',
            handler: restRoleAssignmentsCreate//D
        },
        {
            method: 'get',
            resource: 'role/assigned/role:role/grantedTo:grantedTo',
            apiRestriction: 'base',
            handler: restRoleAssignmentsGet//D
        },
        {
            method: 'get',
            resource: 'role/query/',
            apiRestriction: 'base',
            handler: restRoleAssignmentsQuery//D
        },
        {
            method: 'delete',
            resource: 'role/assigned/:grantedTo/:role?',
            apiRestriction: 'plmgr',
            handler: restRoleAssignmentsDelete//D
        },
    ]
}

module.exports = {
    init: restRoleAssignmentsInit,
    getConfig: restRoleAssignmentsGetConfig
};