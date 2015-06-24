var req = require('request'),
    oauthClient = require('../../../clients/oauth'),
    Token = require('../../../common/resources/token'),
    log = require('common/log')(module),
    async = require('async'),
    passport = require('passport'),
    GetUserEmail = require('../../../common/actions/getUserEmail'),
    configuration = require('configuration');

module.exports = function (app) {
    app.get('/provide/:oauthKey', function (request, response, next) {
        oauthClient.exec('getApplicationByOauthKey', request.params.oauthKey, function (err, application) {
            if (err) {
                log.error(err.message);
                return response.send(500);
            }

            var url = configuration.get("applications:oauth-access:services:web:approvalUrl") + '?applicationid=' + application.applicationId;

            response.redirect(url);
        });
    });

    app.get('/oauth/:applicationId', function (request, response, next) {
        if (!request.query.ticket) {
            return response.send(500);
        }

        function getApplication(callback){
            oauthClient.exec('getApplicationByApplicationId', request.params.applicationId, function (err, application) {
                if(err){
                    return callback(err);
                }

                log.info(application);

                callback(null, application);
            });
        }

        function exchangeTicket(application, callback){
            var data = {
                ticket: request.query.ticket,
                privateKey: application.privateKey,
                applicationId: application.applicationId
            };

            oauthClient.exec('exchange', data, function (err, tokens) {
                if(err){
                    return callback(err);
                }

                log.info(tokens);

                callback(null, application, tokens);
            });
        }

        function getUserEmail(application, tokens, callback){
            (new GetUserEmail(tokens.access_token)).execute(function (err, email) {
                if(err){
                    return callback(err);
                }

                log.info('User email: ' +  email);

                callback(null, application, tokens, email);
            });
        }

        function createToken(application, tokens, email, callback){
            Token.create({
                email: email,
                applicationId: application.applicationId,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                exchange: tokens.exchange
            }, function (err, token) {
                if(err){
                    return callback(err);
                }

                callback(null, token.client_token);
            });
        }

        async.waterfall([
            getApplication,
            exchangeTicket,
            getUserEmail,
            createToken
        ], function (err) {
            if(err){
                log.error(err);
                return response.send(500);
            }

            response.send('ok');
        });
    });

    app.use('/api/:application/*', [
        passport.authenticate('bearer', {session: false}),
        apiRequest
    ]);
};