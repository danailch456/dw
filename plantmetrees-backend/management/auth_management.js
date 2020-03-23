/* Init the logger module */
const logger = require('./logger.js');
const log = new logger().get();

/* Init the node modules */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

class AuthManagement {
    constructor(config) {
        this.config = config;
        this.passport = passport;
    }

    /**
     * Returns the initialized "passport" object 
     */
    initPassport() {
        log.info('[AUTH_MGMT] :: Passport middleware init');
        return this.passport.initialize();
    }

    /**
     * Returns the session of the "passport" object
     */
    sessionPassport() {
        log.info('[AUTH_MGMT] :: Persistent login sessions active');
        return this.passport.session();

    }

    /** 
     * Sets the passport midleware used for serializing and deserializing the user 
     */
    presetUserRialization() {
        this.passport.serializeUser(function (user, done) {
            log.info(`Serealizing user:${user.id}`);
            done(null, user.id);
        });

        this.passport.deserializeUser(function (id, done) {
            global.GDO.findUsers({ id: id }).then(function (user) {
                log.info(`Deserealiznig user:${JSON.stringify(user)}`);
                done(null, user);
            }).catch(function (err) {
                done(err);
            });
        });
    }

    /**
     * Returns express midleware to be used as a first layer 
     * protection of the api against unauthorised users
     */
    ensureAuthenticated() {
        return function (req, res, next) {
            if (req.isAuthenticated() && req.user.status == 'active') {
                return next();
            } else {
                return res.status(401).end();
            }
        }
    }

    /**
     * Returns express midleware to be used as a first layer 
     * protection of the api against unauthorised users
     */
    ensureFacebookAuthenticated() {
        return function (req, res, next) {
            if (req.isAuthenticated() && req.user.status == 'active' && req.user.userType == 'facebook') {
                return next();
            } else {
                return res.status(401).end();
            }
        }
    }

    /**
     * Returns express midleware to be used as a second layer 
     * protection of the api against users without the required role for the current request
     */
    ensureHasRole(role) {
        return function (req, res, next) {
            if (req.isAuthenticated() && req.user.status == 'active') {
                global.GDO.hasRole(req.user.id, role).then(function () {
                    return next();
                }).catch(function () {
                    return res.status(401).end();
                });
            } else {
                return res.status(401).end();
            }
        }
    }

    /**
     * Generates the configuration object for creating a third party application strategy 
     * @param {String} appName The name of the third party application(lower case letters only)
     * @returns {Object} configuration object to be passed as a first parameter when creating a third party app strategy
     */
    getThirdPartyAppStrategyConfig(appName) {
        let host = (appName == 'facebook') ? 'localhost' : '127.0.0.1'
        //facebook api considers 'localhost' for loopback adress;
        //google api consideres '127.0.0.1' for loopback adress;
        return {
            clientID: this.config[appName].client_id,
            clientSecret: this.config[appName].client_secret,
            callbackURL: `http://${host}:8089/rest/v1/session/${appName}/callback`,
            profileFields: ['id', 'emails', 'name'],
            passReqToCallback: true
        }
    }

    /**
     * Returns new LocalStrategy object initialized with functioning authentication middleware
     */
    localStrategy() {
        return new LocalStrategy(
            function (email, password, done) {
                log.info(`[AUTH_MGMT] :: Local login request recieved email:${JSON.stringify(email)} , password:${JSON.stringify(password)}`);
                global.GDO.findUsers({
                    email,
                    localPassHash: password,
                    userType: 'local'
                }).then(function (userProfile) {
                    if (userProfile.status != 'active') {
                        log.error(`[AUTH_MGMT] :: User is blocked for the moment - email:${JSON.stringify(email)} , password:${JSON.stringify(password)}`);
                        return done(null, false);
                    } else {
                        log.info(`User:${JSON.stringify(userProfile)} has logged in successfully`);
                        return done(null, userProfile);
                    }
                }).catch(function (err) {
                    if (err == "SequelizeEmptyResultError") {
                        log.error(`[AUTH_MGMT] :: User not found email:${JSON.stringify(email)} , password:${JSON.stringify(password)}`);
                        return done(null, false);
                    } else {
                        log.error((typeof err == 'object') ? JSON.stringify(err) : err);
                    }
                    done(err);
                });
            }
        )
    }


    /**
     * Returns new GoogleStrategy object initialized with functioning authentication middleware
     */
    googleStrategy() {
        return new GoogleStrategy(
            this.getThirdPartyAppStrategyConfig('google'),
            function (req, accessToken, refreshToken, profile, done) {
                log.info(`googleProfile:${JSON.stringify(profile)}`);
                global.GDO.userFindOrCreate({ googleId: profile.id },
                    {
                        firstName: profile.given_name,
                        lastName: profile.family_name,
                        userType: 'google'
                    }, function (err, user, created) {
                        if (err) {
                            done(err);
                        } else if (user.status != 'active') {
                            log.error(`[AUTH_MGMT] :: User is blocked for the moment ${user.id}`);
                            return done(null, false);
                        } else {
                            if (created) {
                                global.GDO.resolveInvitationLink(req.query.token);
                            }
                            done(null, user);
                        }
                    });
            });
    }

    /**
     * Returns new FacebookStrategy object initialized with functioning authentication middleware
     */
    facebookStrategy() {
        return new FacebookStrategy(
            this.getThirdPartyAppStrategyConfig('facebook'),
            function (req, accessToken, refreshToken, profile, done) {
                log.info(JSON.stringify(profile));
                global.GDO.userFindOrCreate({ facebookId: profile.id },
                    {
                        firstName: profile.displayName,
                        userType: 'facebook',
                        email: profile._json.email
                    }, function (err, user, created) {
                        if (err) {
                            done(err);
                        } else if (user.status != 'active') {
                            log.error(`[AUTH_MGMT] :: User is blocked for the moment - email:${JSON.stringify(email)} , password:${JSON.stringify(password)}`);
                            return done(null, false);
                        } else {
                            if (created) {
                                global.GDO.resolveInvitationLink(req.query.token);
                            }
                            done(null, user);
                        }
                    });
            });
    }

    /*
    vkontakteStrategy() {
        //return new 
    }*/

    /**
     * Pass a strategy to passport for future use 
     * @param {Object} Strategy object initialized with functioning authentication middleware
     */
    passportUse(Strategy) {
        this.passport.use(Strategy);
    }



    getApiRestrictionMidleware(restrictionLevel) {
        return new Promise((resolve, reject) => {//used arrow function in order to preserve 'this'
            let objectMap = {
                local: this.passport.authenticate('local'),
                google: this.passport.authenticate('google', {
                    scope: ['https://www.googleapis.com/auth/plus.login']
                }),
                gglclbk: this.passport.authenticate('google'),
                facebook: this.passport.authenticate('facebook', { scope: ['email'] }),
                fbclbk: this.passport.authenticate('facebook'),
                fbuser: this.ensureFacebookAuthenticated(),
                base: this.ensureAuthenticated(),
                plmgr: this.ensureHasRole('platform_manager'),
                cntedtr: this.ensureHasRole('content_editor'),
                cntrtr: this.ensureHasRole('content_writer'),
                mrcmngr: this.ensureHasRole('merch_manager'),
                plass: this.ensureHasRole('planter_associate'),
                plvol: this.ensureHasRole('planter_volunteer'),
                plsup: this.ensureHasRole('planter_suporter'),
            }
            if (objectMap[restrictionLevel]) {
                resolve(objectMap[restrictionLevel]);
            } else {
                reject();
            }
        });
    }
}



module.exports = AuthManagement;