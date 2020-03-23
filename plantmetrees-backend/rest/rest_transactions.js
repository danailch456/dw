const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restTransactionsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function restTransactionsGet(req, res){
    let requestId = _rest.generateReqId();
    
    _handler.transactionsGet(req.user.id, [req.query.limit, req.query.offset],function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restTransactionsAdminGet(req, res) {
    let requestId = _rest.generateReqId();

    _handler.transactionsGet(req.params.userId, [req.query.limit, req.query.offset],function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        }
    });
}

function restTransactionsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'transactions',
            apiRestriction: 'base',
            handler: restTransactionsGet
        },
        {
            method: 'get',
            resource: 'transactions/user:userId',
            apiRestriction: 'plmgr',
            handler: restTransactionsAdminGet
        }
    ]
}

module.exports = {
    init: restTransactionsInit,
    getConfig: restTransactionsGetConfig
};