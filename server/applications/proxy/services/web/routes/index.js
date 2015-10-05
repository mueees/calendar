var req = require('request'),
    oauthClient = require('../../../clients/oauth'),
    Token = require('../../../common/resources/token'),
    OauthAccess = require('../../../common/resources/oauth-access'),
    OauthRequest = require('common/request/oauth'),
    log = require('common/log')(module),
    async = require('async'),
    passport = require('passport'),
    apiRequest = require('../middlewares/apiRequest'),
    refreshAccessToken = require('../middlewares/refreshAccessToken'),
    GetUserEmail = require('../../../common/actions/GetUserEmail'),
    configuration = require('configuration');

module.exports = function (app) {
    app.get('/provide/:oauthKey', function (request, response) {
        OauthRequest.getApplicationByOauthKey(request.params.oauthKey).then(function (res) {
            var approvalUrl;

            if ((process.env.NODE_ENV == "development")) {
                approvalUrl = configuration.get("applications:proxy:services:web:approvalUrlDev");
            } else {
                approvalUrl = configuration.get("applications:proxy:services:web:approvalUrl");
            }

            response.redirect(approvalUrl + '?applicationid=' + res.body.applicationId);
        }, function (res) {
            log.error(res.body.message);

            response.render('postMessage', {
                response: JSON.stringify({
                    status: 400,
                    message: 'Server error'
                }),
                meta: JSON.stringify({
                    domain: null
                })
            });
        });
    });

    app.get('/oauth/:applicationId', function (request, response) {
        if (!request.query.ticket) {
            log.error('Cannot find ticket');

            return response.render('postMessage', {
                response: JSON.stringify({
                    status: 400,
                    message: 'Cannot find ticket'
                }),
                meta: JSON.stringify({
                    domain: null
                })
            });
        }

        function getApplication(callback) {
            OauthRequest.getApplicationByApplicationId(request.params.applicationId).then(function (res) {
                callback(null, res.body);
            }, function (res) {
                callback(res.body.message);
            });
        }

        function exchangeTicket(application, callback) {
            OauthRequest.exchange({
                ticket: request.query.ticket,
                privateKey: application.privateKey,
                applicationId: application.applicationId
            }).then(function (res) {
                callback(null, application, res.body);
            }, function (res) {
                callback(res.body.message);
            });
        }

        function getUserEmail(application, tokens, callback) {
            (new GetUserEmail(tokens.access_token)).execute(function (err, email) {
                if (err) {
                    return callback(err);
                }

                callback(null, application, tokens, email);
            });
        }

        function createOrUpdateOauthAccess(application, tokens, email, callback) {
            OauthAccess.findOne({
                email: email,
                applicationId: application.applicationId,
                privateKey: application.privateKey
            }, function (err, oauthAccess) {
                if (err) {
                    return callback(err);
                }

                if (oauthAccess) {
                    // should update existing oauthAccess
                    OauthAccess.update({
                        email: email,
                        applicationId: application.applicationId,
                        privateKey: application.privateKey
                    }, {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        exchange: tokens.exchange
                    }, function (err) {
                        if (err) {
                            return callback(err);
                        }

                        oauthAccess.access_token = tokens.access_token;
                        oauthAccess.refresh_token = tokens.refresh_token;
                        oauthAccess.exchange = tokens.exchange;

                        callback(null, oauthAccess, application);
                    });
                } else {
                    // should create oauthAccess
                    OauthAccess.create({
                        email: email,
                        applicationId: application.applicationId,
                        privateKey: application.privateKey,
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        exchange: tokens.exchange
                    }, function (err, oauthAccess) {
                        if (err) {
                            return callback(err);
                        }

                        callback(null, oauthAccess, application);
                    });
                }
            });
        }

        function createToken(oauthAccess, application, callback) {
            log.info(oauthAccess);

            Token.create({
                oauthAccessId: oauthAccess._id
            }, function (err, token) {
                if (err) {
                    return callback(err);
                }

                callback(null, token, application);
            });
        }

        async.waterfall([
            getApplication,
            exchangeTicket,
            getUserEmail,
            createOrUpdateOauthAccess,
            createToken
        ], function (err, token, application) {
            if (err) {
                log.error(err);

                return response.render('postMessage', {
                    response: JSON.stringify({
                        status: 400,
                        message: 'Server error'
                    })
                });
            }

            response.render('postMessage', {
                response: JSON.stringify({
                    status: 200,
                    client_token: token.client_token
                }),
                meta: JSON.stringify({
                    domain: application.domain
                })
            });
        });
    });

    app.use(function (request, response, next) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        next();
    });

    // send all request to proxy server
    app.get('/api/:application/*', [
        passport.authenticate('bearer', {session: false}),
        refreshAccessToken,
        apiRequest
    ]);

    app.post('/api/:application/*', [
        passport.authenticate('bearer', {session: false}),
        refreshAccessToken,
        apiRequest
    ]);
};