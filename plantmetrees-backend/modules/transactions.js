const logger = require('../management/logger.js');
const log = new logger().get();

let _db = null;

function transactionsInit(db) {
    _db = db;
}

function transactionsGet(userId, callback) {
    let options = {
        raw: true,
        rejectOnEmpty: true,
        order: _db.order('userId', 'ASC'),
        where: {
            userId
        }
    };

    if (pagination[0]) {
        options.limit = pagination.shift();
    }

    if (pagination[1]) {
        options.offset = pagination.shift();
    }

    _db.models.Transactions.findAll(options).then(function (result) {
        callback(null, result);
    }).catch(function (err) {
        callback(err);
    });
}

module.exports = {
    init: transactionsInit,
    transactionsGet
}