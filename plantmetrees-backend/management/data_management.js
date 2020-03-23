/* Init the logger module */
const logger = require('./logger.js');
const log = new logger().get();

const fs = require('fs');
const yml = require('js-yaml');

/* Models definition is required */
const modelsHdlr = require('../objectmaps/data_models.js');

/* Import sequelize */
const Sequelize = require('sequelize');

const admin = yml.safeLoad(fs.readFileSync('default_admin.yml', 'utf8'));

class DataManagement {
    constructor(config) {
        this.config = config.sequelize;
    }

    /**
     * Creates sequelize instance , initializes the model hooks with 
     * the exported object from "hooks.js" file, initializes the models 
     * and syncs the changes with the database
     */
    dbConnect() {
        //create sequelize instance
        this.sequelizeHdlr = new Sequelize(
            this.config.db_name,
            this.config.user,
            this.config.password,
            this.config.connection,
            this.config.force_sync
        );

        //init hooks
        modelsHdlr.initHooks(require('../objectmaps/hooks'));

        //init models
        this.models = modelsHdlr.initModels(this.sequelizeHdlr);

        this.sequelizeHdlr.sync({
            force: this.config.force_sync
        }).then(() => {
            /* Usage of arrow function in order to preserve 'this' */
            log.info(
                `[DATA_MGMT] :: Connected to '${this.config.db_name}'` +
                ` at ${this.config.connection.host}:${this.config.connection.port}`
            );
            //defines the global_database_operations('GDO') object as a property of the global namespace object ('global')
            Object.defineProperty(global, 'GDO', {
                writable: false,
                value: require('../modules/global_database_operations')(this)
            });

            admin.userType = 'local';

            global.GDO.userFindOrCreate({
                id: 1
            }, admin, (err, found, created) => {
                /* Usage of arrow function in order to preserve 'this' */
                if (err) {
                    return log.error(`Error:${(typeof err == 'object') ? err.toString() : err}`);
                }
                if (created) {
                    this.models.RoleAssignments.create({
                        role: 'platform_admin',
                        grantedTo: 1,
                        grantedBy: 1,
                        remark: 'default platform admin'
                    }).then(function () {
                        log.info(`Default platform admin created`);
                    });
                } else {
                    log.info(`Default platform admin exists`);
                }
            });
        }).catch((error) => {
            log.error(
                `[DATA_MGMT] :: Unable to connect to '${this.config.db_name}'` +
                ` at ${this.config.connection.host}:${this.config.connection.port}`
            );
            log.error(error);
        });

    }

    increment(field) {
        return this.sequelizeHdlr.literal(`${field} + 1`);
    }

    order(col, dir) {
        return [
            [this.sequelizeHdlr.col(col), dir]
        ];
    }

    or() {
        return Sequelize.Op.or;
    }

}

module.exports = DataManagement;