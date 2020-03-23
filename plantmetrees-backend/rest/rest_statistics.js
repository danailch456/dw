const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restStatisticsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

function checkBodyFormat(body){
    //TODO
}

function restStatisticsGet(req, res){
    let requestId = _rest.generateReqId();

    //TODO
}

function restStatisticsGetConfig() {
    return [
        {
            method: 'get',
            resource: 'statistics',
            apiRestriction: null,
            handler: restStatisticsGet
        }
    ]
}

module.exports = {
    init: restStatisticsInit,
    getConfig: restStatisticsGetConfig
};