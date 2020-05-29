const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restRoleAssignmentsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function checkBodyFormat(body) {
    return (body.latitude != null &&
        body.longitude != null&&
        body.datetime != null)
}

function parseBody(body) {
    return {
        latitude: body.latitude,
        longitude: body.longitude,
        altitude: body.altitude,
        accuracy: body.accuracy,
        altitudeAccuracy: body.altitudeAccuracy,
        datetime: body.datetime,
        tagName: body.tagName,
        tagProperties: body.tagProperties
    }
}

function restGeoTagCreate(req, res) {
    let requestId = _rest.generateReqId();

    if (!checkBodyFormat(req.body)) {
        log.error(`Body for creating geotag request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, { name: 'InvalidBodyFormat' });
    }

    let geoTagObject = parseBody(req.body);

    geoTagObject.identityHash = '';

    _handler.geoTagCreate(geoTagObject, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 201, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restGeoTagsGet(req, res) {
    let requestId = _rest.generateReqId();

    _handler.geoTagsGet(null, function (err, geoTags) {
        if (!err) {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, geoTags);
        } else {
            return _rest.error(res, requestId, err);
        }
    });
}

function restGeoTagQuery(req, res) {
    let requestId = _rest.generateReqId();
    
    if (!req.query.ownerId) {
        log.error(`Missing 'ownerId' query parameter for finding geo tag ${JSON.stringify(req.query)}`);
        return _rest.error(res, requestId, { name: 'MissingQueryParameter' });
    }

    _handler.geoTagsGet(req.query.tagType, function (err, geoTags) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, geoTags);
        }
    });
}

function restGeoTagsEdit(req, res) {
    let requestId = _rest.generateReqId();
    
    if (!req.params.id) {
        log.error(`Missing parameter 'id' for editing geo tag${JSON.stringify(req.params)}`);
        return _rest.error(res, requestId, { name: 'MissingPathParameter' });
    }

    let updateObject = parseBody(req.body);

    _handler.geoTagEdit(req.params.id, updateObject, function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restGeoTagsDelete(req, res) {
    if (!req.params.id) {
        log.error(`Missing parameter 'id' for deleting geo tag${JSON.stringify(req.params)}`);
        return res.status(400).end();
    }

    let requestId = _rest.generateReqId();

    _handler.geoTagsDelete(req.params.id, function (err) {
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
            resource: 'geotags',
            apiRestriction: 'base',
            handler: restGeoTagCreate
        },
        {
            method: 'get',
            resource: 'geotags',
            apiRestriction: 'base',
            handler: restGeoTagsGet
        },
        {
            method: 'get',
            resource: 'geotags/query/',
            apiRestriction: 'base',
            handler: restGeoTagQuery
        },
        {
            method: 'put',
            resource: 'geotags/:id',
            apiRestriction: 'base',
            handler: restGeoTagsEdit
        },
        {
            method: 'delete',
            resource: 'geotags/:id',
            apiRestriction: 'base',
            handler: restGeoTagsDelete
        }
    ]
}

module.exports = {
    init: restRoleAssignmentsInit,
    getConfig: restRoleAssignmentsGetConfig
};