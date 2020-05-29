const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function statisticsInit(db) {
    _db = db;
}

function getTotalTrees(mapView, callback) {
    log.info(`Map view:${mapView}`);

    const options = {
        raw:true,
        rejectOnEmpty:true
    };

    _db.models.Forests.findAll(options).then(async function (forests) {
        let promises = [];

        forests.forEach(forest => {
            promises.push(new Promise(function (resolve, reject) {
                GDO.forestInPolygon(forest.id, mapView).then(function () {
                    log.info(`Forest with id:${forest.id} IS inside the map view`);
                    resolve(forest.estimateTrees);
                }).catch(function () {
                    log.info(`Forest with id:${forest.id} ISN'T inside the map view`);
                    resolve(null);
                });
            }));
        });

        await Promise.all(promises).then(function (estimateTreeValues) {
            log.info("Resolve out");
            let sum = estimateTreeValues.reduce(function (a, b) {
                return a + b;
            }, 0);
            callback(null, sum);
        }).catch(function (err) {
            log.error(err);
            callback(err);
        });
    }).catch(function (err) {
        log.error(err);
        callback(err);
    })
}

module.exports = {
    init: statisticsInit,
    getTotalTrees
}