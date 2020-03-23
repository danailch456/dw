/* Init the node modules*/
const fs = require('fs');
const yml = require('js-yaml');
const winston = require('winston');

/* Define the config files from manifest */
const configFiles = require('../_config_manifest.json');

/* Load the config files */
const config = yml.safeLoad(fs.readFileSync(
    `${configFiles.config_file}`,
    'utf8'
));


class log {

    constructor() {
        this.logger = winston.createLogger({
            level: config.debug_level,
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize({
                            all: true
                        }),
                        winston.format.simple()
                    )

                })

            ]

        });

    }

    common(_level, _message) {
        const timeStr = new Date().toISOString();

        this.logger.log(_level, `${timeStr} - ${_message}`)
    }

    error(_message) {
        this.common('error', _message);
    }

    warn(_message) {
        this.common('warn', _message);
    }

    info(_message) {
        this.common('info', _message);
    }

    verbose(_message) {
        this.common('verbose', _message);
    }

    debug(_message) {
        this.common('debug', _message);
    }


}

class loggerSingleton {

    constructor() {
        if (!loggerSingleton.instance) {
            loggerSingleton.instance = new log();
        }
    }

    get() {
        return loggerSingleton.instance;
    }

}

module.exports = loggerSingleton;