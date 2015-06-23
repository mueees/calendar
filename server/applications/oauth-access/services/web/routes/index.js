var req = require('request'),
    oauthClient = require('../../../clients/oauth'),
    Token = require('../../../common/resources/token'),
    Token = require('../../../common/resources/token'),
    configuration = require('configuration');

module.exports = function (app) {
    app.get('/provide/:oauthKey', function (request, response, next) {
        oauthClient.exec('getApplicationByOauthKey', request.params.oauthKey, function (err, application) {
            if (err) {
                console.log(err);
                return response.redirect('/error/provide');
            }

            var url = configuration.get("applications:oauth-access:services:web:approvalUrl") + '?applicationid=' + application.applicationId;

            response.redirect(url);
        });
    });

    app.get('/oauth/:applicationId', function (request, response, next) {
        var ticket = request.query.ticket;

        if (!ticket) {
            return response.redirect('/error/oauth');
        }

        console.log('applicationId: ' + request.params.applicationId);

        // find application for getting privateKey
        oauthClient.exec('getApplicationByApplicationId', request.params.applicationId, function (err, application) {
            if (err) {
                console.log(err);
                return response.redirect('/error/oauth');
            }

            console.log('got application');
            console.log(application);

            var data = {
                ticket: ticket,
                privateKey: application.privateKey,
                applicationId: application.applicationId
            };

            oauthClient.exec('exchange', data, function (err, tokens) {
                // tokens contains access, refresh and exchange parameters
                // get user email

                if (err) {
                    console.log('exchange got error');
                    console.log(err);
                    return;
                }

                console.log('tokens');
                console.log(tokens);

                req({
                    url: 'http://localhost:6005/api/account/user',
                    headers: {
                        'Authorization': 'Bearer ' + tokens.access_token
                    }
                }, function (err, response, body) {
                    if(err){
                        console.log("account info got error");
                        console.log(err);
                        return;
                    }

                    console.log(body);
                });

            });

            //response.redirect(url);
        });
    });
};