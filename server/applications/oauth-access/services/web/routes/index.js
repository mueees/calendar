var request = require('request'),
    oauthClient = require('../../../clients/oauth'),
    Token = require('../../../common/resources/token'),
    oauthAccessConfig = require('../../../config');

module.exports = function (app) {
    app.get('/provide/:oauthKey', function (request, response, next) {
        oauthClient.exec('getApplicationByOauthKey', request.params.oauthKey, function (err, application) {
            if (err) {
                return response.redirect('/error/provide');
            }

            var url = oauthAccessConfig.get('approvalUrl') + 'applicationid=' + application.applicationId;

            response.redirect(url);
        });
    });

    app.get('/oauth/:applicationId/:ticket', function (request, response, next) {
        var ticket = request.query.ticket;

        if (!ticket) {
            return response.redirect('/error/oauth');
        }

        // find application for getting privateKey
        oauthClient.exec('getApplicationById', request.params.applicationId, function (err, application) {
            if (err) {
                return response.redirect('/error/oauth');
            }

            var data = {
                ticket: ticket,
                privateKey: application.privateKey,
                applicationId: applicationId
            };

            oauthClient.exec('exchange', data, function (err, tokens) {
                // tokens contains access, refresh and exchange parameters
                // get user email

                request({
                    url: 'http://localhost:6005/api/account/info',
                    headers: {
                        'Aauthorization': 'Bearer ' + tokens.access_token
                    }
                }, function (err, response, body) {
                    if (!error && response.statusCode == 200) {
                        var info = JSON.parse(body);
                    }
                });

            });

            response.redirect(url);
        });
    });
};