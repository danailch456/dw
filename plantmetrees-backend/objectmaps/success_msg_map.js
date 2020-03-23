let objectMap = {
    '/rest/v1/session/local': {
        POST: 'local_session_ok'
    },
    '/rest/v1/session': {
        DELETE: 'session_closed'
    },
    '/rest/v1/users/create': {
        POST: 'user_created'
    },
    '/rest/v1/users': {
        GET: 'user_identities_enumerated'
    },
    '/rest/v1/user/:id': {
        GET: 'user_enumerated',
        PUT: 'user_edited',
        DELETE: 'user_deleted'
    },
    '/rest/v1/user': {
        GET: 'user_enumerated'
    },
    '/rest/v1/session/google/callback': {
        GET: 'google_verify_callback'
    },
    '/rest/v1/role/assign':{
        POST:'role_assigned'
    },
    'rest/v1/role/assigned/:grantedTo/:role':{
        GET:'role_assignment_checked',
        DELETE:'role_assignments_deleted'
    },
    'rest/v1/role/query/':{
        GET:'role_assignments_enumerated'
    }
}

module.exports = function (path,method) {
    try {
        return objectMap[path][method];
    } catch (err) {
        return null;
    }
}