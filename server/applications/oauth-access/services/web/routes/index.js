var req = require('request'),
    oauthClient = require('../../../clients/oauth'),
    Token = require('../../../common/resources/token'),
    log = require('common/log')(module),
    async = require('async'),
    passport = require('passport'),
    apiRequest = require('../middlewares/apiRequest'),
    refreshAccessToken = require('../middlewares/refreshAccessToken'),
    GetUserEmail = require('../../../common/actions/GetUserEmail'),
    configuration = require('configuration');

module.exports = function (app) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/provide/:oauthKey', function (request, response) {
        oauthClient.exec('getApplicationByOauthKey', request.params.oauthKey, function (err, application) {
            if (err) {
                log.error(err.message);
                return response.render('postMessage', {
                    response: JSON.stringify({
                        status: 400,
                        message: 'Server error'
                    }),
                    meta: JSON.stringify({
                        domain: null
                    })
                });
            }

            var url = configuration.get("applications:oauth-access:services:web:approvalUrl") + '?applicationid=' + application.applicationId;

            response.redirect(url);
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
            oauthClient.exec('getApplicationByApplicationId', request.params.applicationId, function (err, application) {
                if (err) {
                    return callback(err);
                }

                log.info(application);

                callback(null, application);
            });
        }

        function exchangeTicket(application, callback) {
            var data = {
                ticket: request.query.ticket,
                privateKey: application.privateKey,
                applicationId: application.applicationId
            };

            oauthClient.exec('exchange', data, function (err, tokens) {
                if (err) {
                    return callback(err);
                }

                log.info(tokens);

                callback(null, application, tokens);
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

        function createToken(application, tokens, email, callback) {
            Token.create({
                email: email,
                applicationId: application.applicationId,
                privateKey: application.privateKey,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                exchange: tokens.exchange
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
            createToken
        ], function (err, token, application) {
            if (err) {
                log.error(err);
                
                return response.render('postMessage', {
                    response: JSON.stringify({
                        status: 400,
                        message: 'Server error'
                    }),
                    meta: JSON.stringify({
                        domain: application.domain || null
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

    // send all request to proxy server
    app.use('/api/:application/*', [
        passport.authenticate('bearer', {session: false}),
        refreshAccessToken,
        apiRequest
    ]);
};