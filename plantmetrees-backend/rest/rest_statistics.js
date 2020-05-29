const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restStatisticsInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

async function checkBodyFormat(body) {
    if (typeof body != Array && body.length != 4) return false;
    let promises = [];

    body.forEach(point => {
        promises.push(new Promise(function (resolve, reject) {
            if (typeof point == Array && point.length == 2) {
                resolve();
            } else {
                reject();
            }
        }));
    });

    await Promise.all(promises).then(function () {
        return true;
    }).catch(function (err) {
        return false;
    });
}

function restStatisticsGet(req, res) {
    let requestId = _rest.generateReqId();

    if (!checkBodyFormat(req.body)) {
        log.error(`Body for generating statistics request doesn't meet format requirements ${JSON.stringify(req.body)}`);
        return _rest.error(res, requestId, {
            name: 'InvalidBodyFormat'
        });
    }

    _handler.getTotalTrees(req.body, function (err, result) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, {
                url: req.path,
                method: req.method
            }, requestId, GDO.applyConstants(result));
        }
    });
}

function restStatisticsGetConfig() {
    return [{
        method: 'post',
        resource: 'statistics',
        apiRestriction: null,
        handler: restStatisticsGet
    }]
}

module.exports = {
    init: restStatisticsInit,
    getConfig: restStatisticsGetConfig
};