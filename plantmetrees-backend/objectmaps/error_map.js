let objectMap = {
    SequelizeDatabaseError: {
        status: 409,
        error_msg: 'forbiden_opperation'
    },
    SequelizeUniqueConstraintError: {
        status: 409,
        error_msg: 'duplicate_object'
    },
    SequelizeEmptyResultError: {
        status: 404,
        error_msg: 'not_found'
    },
    SequelizeForeignKeyConstraintError: {
        status: 409,
        error_msg: 'invalid_foreign_key'
    },
    Unauthorized: {
        status: 401,
        error_msg: 'unauthorized'
    },
    MissingPathParameter: {
        status: 400,
        error_msg: 'missing_path_parameter'
    },
    MissingQueryParameter: {
        status: 400,
        error_msg: 'missing_query_parameter'
    },
    InvalidBodyFormat: {
        status: 400,
        error_msg: 'invalid_body_format'
    },
    PermissionDenied:{
        status: 403,
        error_msg: 'no_permission'
    },
    NoForestsInMapView:{
        status:404,
        error_msg:'no_forests_in_map_view'
    }
}

module.exports = function (errName) {
    if(objectMap[errName]){
        return objectMap[errName];
    } else {
        return {
            status: 500,
            error_msg: 'internal_server_error'
        }
    }    
}