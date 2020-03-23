const Sequelize = require('sequelize');

let _hooks = null;

function hooksInit(hooks) {
    _hooks = hooks;
}

function modelsInit(_sequelizeHdlr) {

    /* Models */
    const Users = _sequelizeHdlr.define('users', {

        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: Sequelize.STRING(255),
            unique: true,
            validate: {
                isEmail: true
            },
            defaultValue: null
        },

        googleId: {
            type: Sequelize.STRING(255),
            unique: true
        },

        facebookId: {
            type: Sequelize.STRING(255),
            unique: true
        },
        /* SHA3-256 hash of the local password */
        localPassHash: {
            type: Sequelize.STRING
        },
        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        geoLocation: {
            type: Sequelize.JSON,
        },
        addressCountry: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        addressCity: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        addressInfo: {
            type: Sequelize.STRING
        },
        lastLogin: {
            type: Sequelize.DATE
        },
        userType: {
            type: Sequelize.ENUM('local', 'facebook', 'google', 'vkontakte'),
            defaultValue: 'local'
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        hooks: _hooks.User
    });

    const RoleAssignments = _sequelizeHdlr.define('role_assignments', {
        role: {
            type: Sequelize.ENUM(
                'platform_admin',
                'platform_manager',
                'content_editor',
                'content_writer',
                'merch_manager',
                'planter_associate',
                'planter_volunteer',
                'planter_suporter'
            ),
            primaryKey: true
        },
        grantedTo: {
            type: Sequelize.INTEGER.UNSIGNED
        },
        grantedBy: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false
        },
        remark: {
            type: Sequelize.STRING
        }

    }, {
        hooks: _hooks.RoleAssignments
    });

    const Badges = _sequelizeHdlr.define('badges', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        progress: {
            type: Sequelize.INTEGER.UNSIGNED
        },
        type: {
            type: Sequelize.ENUM(
                'supporter',
                'organizer',
                'community',
            )
        }
    }, {
        hooks: _hooks.Badges
    });

    const GeoTags = _sequelizeHdlr.define('geo_tags', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        latitude: {
            /* Latitudes range from -90 to +90 degrees */
            type: Sequelize.DECIMAL,
            allowNull: false
        },
        longitude: {
            /* Longitudes range from -180 to +180 degrees */
            type: Sequelize.DECIMAL,
            allowNull: false
        },
        altitude: {
            /* WGS 84 above mean sea level in meters*/
            type: Sequelize.INTEGER
        },
        accuracy: {
            /* Point accuracy in meters */
            type: Sequelize.INTEGER
        },
        altitudeAccuracy: {
            /* Elevation accuracy in meters */
            type: Sequelize.INTEGER
        },
        datetime: {
            type: Sequelize.DATE,
            allowNull: false
        },
        identityHash: {
            /*
             GeoTag identification md5 hash :: "latitude;longitute;datetime"
             e.g. "50.167958;-97.133185;2019-12-31 23:59:59" => "9b3d969bdbc5273567b7d9280c3790b5"
            */
            type: Sequelize.STRING,
            allowNull: false
        },
        tagName: {
            type: Sequelize.STRING
        },
        tagProperties: {
            type: Sequelize.JSON
        }

    }, {
        hooks: _hooks.GeoTags
    });

    const Polygons = _sequelizeHdlr.define('polygons', {
        longitude: {
            type: Sequelize.DECIMAL,
            allowNull: false
        },
        latitude: {
            type: Sequelize.DECIMAL,
            allowNull: false
        }
    }, {
        hooks: _hooks.Forests
    });

    const Forests = _sequelizeHdlr.define('forests', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        forestName: {
            type: Sequelize.STRING
        },
        state: {
            type: Sequelize.ENUM(
                'campaign_planned',
                'successfuly_planted',
                'maintenance_required'
            ),
            defaultValue: 'campaign_planned'
        },
        forestRegion: {
            type: Sequelize.JSON
        },
        estimateTrees: {
            type: Sequelize.INTEGER.UNSIGNED
        },
        area: {
            /* in square meters*/
            type: Sequelize.INTEGER.UNSIGNED
        }

    }, {
        hooks: _hooks.Forests
    });

    const ForestInsectHotels = _sequelizeHdlr.define('forest_insect_hotels', {
        // Prepare model to be passed as relation
    }, {
        hooks: _hooks.ForestInsectHotels
    });

    const Campaigns = _sequelizeHdlr.define('campaigns', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        totalEuroCost: {
            type: Sequelize.INTEGER.UNSIGNED
        },
        totalEuroFounded: {
            type: Sequelize.INTEGER.UNSIGNED,
            defaultValue: 0
        },
        transactionData: {
            type: Sequelize.JSON
        }
    }, {
        hooks: _hooks.InvitationLinks
    });

    const CampaignVolunteers = _sequelizeHdlr.define('campaign_volunteers', {
        // Prepare model to be passed as relation
    }, {
        hooks: _hooks.CampaignVolunteers
    });

    const Transactions = _sequelizeHdlr.define('transactions', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        euro: {
            type: Sequelize.FLOAT.UNSIGNED
        },
        item: {
            type: Sequelize.STRING
        }
    }, {
        hooks: _hooks.Transactions
    });

    const InvitationLinks = _sequelizeHdlr.define('invitation_link', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        token: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        peopleInvited: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        link: {
            type: Sequelize.STRING,
            allowNull: false
        }

    }, {
        hooks: _hooks.InvitationLinks
    });

    const NewsfeedPosts = _sequelizeHdlr.define('newsfeed_posts', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        photo: {
            type: Sequelize.BLOB
        },
        text: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM(
                'visible',
                'hidden'
            ),
            defaultValue: 'hidden'
        }

    }, {
        hooks: _hooks.NewsfeedPosts
    });

    const NewsfeedLikes = _sequelizeHdlr.define('newsfeed_likes', {
        // Prepare model to be passed as relation
    }, {
        hooks: _hooks.UsersNewsfeedLikes
    });



    // /* Relations */
    Users.hasMany(RoleAssignments, {
        foreignKey: 'grantedTo',
        sourceKey: 'id'
    });

    Users.hasMany(Badges, {
        foreignKey: 'ownerId',
        sourceKey: 'id'
    });

    InvitationLinks.belongsTo(Users, {
        foreignKey: 'ownerId',
        targetKey: 'id'
    });

    RoleAssignments.belongsTo(Users, {
        foreignKey: 'grantedBy',
        targetKey: 'id'
    });

    Forests.belongsTo(Campaigns, {
        foreignKey: 'campaignId',
        targetKey: 'id'
    });

    GeoTags.belongsToMany(Forests, {
        through: ForestInsectHotels
    });

    Users.belongsToMany(Campaigns, {
        through: CampaignVolunteers
    });

    Campaigns.belongsTo(Users, {
        foreignKey: 'managerId',
        targetKey: 'id'
    });

    NewsfeedPosts.belongsTo(Users, {
        foreignKey: 'postedBy',
        targetKey: 'id'
    });

    NewsfeedPosts.belongsTo(Users, {
        foreignKey: 'editedBy',
        targetKey: 'id'
    });

    GeoTags.belongsTo(Users, {
        foreignKey: 'ownerId',
        targetKey: 'id'
    });

    NewsfeedPosts.belongsToMany(Users, {
        through: NewsfeedLikes
    });

    Transactions.belongsTo(Users, {
        foreignKey: 'userId',
        targetKey: 'id'
    });

    Polygons.belongsTo(Forests, {
        foreignKey: 'forestId',
        targetKey: 'id'
    });

    return {
        Users,
        RoleAssignments,
        GeoTags,
        InvitationLinks,
        Badges,
        CampaignVolunteers,
        Campaigns,
        Forests,
        ForestInsectHotels,
        NewsfeedLikes,
        NewsfeedPosts
    }
}


module.exports = {
    initModels: modelsInit,
    initHooks: hooksInit
}