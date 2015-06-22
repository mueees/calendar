var request = require('request'),
    oauthClient = require('../../../clients/oauth'),
    Token = require('../../../common/resources/token'),
    oauthAccessConfig = require('../../../config');

module.exports = function (app) {
    app.get('/provide/:oauthKey', function (request, response, next) {
        oauthClient.exec('getApplicationByOauthKey', request.params.oauthKey, function (err, application) {
            if (err) {
                console.log(err);
                return response.redirect('/error/provide');
            }

            var url = oauthAccessConfig.get('approvalUrl') + '?applicationid=' + application.applicationId;

            response.redirect(url);
        });
    });

    app.get('/oauth/:applicationid', function (request, response, next) {
        var ticket = request.query.ticket;

        if (!ticket) {
            return response.redirect('/error/oauth');
        }

        console.log('applicationid: ' + request.params.applicationid);

        // find application for getting privateKey
        oauthClient.exec('getApplicationById', request.params.applicationid, function (err, application) {
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

                if(err){
                    console.log('exchange got error');
                    console.log(err);
                    return;
                }

                console.log('tokens');
                console.log(tokens);

                request({
                    url: 'http://localhost:6005/api/account/info',
                    headers: {
                        'Authorization': 'Bearer ' + tokens.access_token
                    }
                }, function (err, response, body) {
                    if (!error && response.statusCode == 200) {
                        var info = JSON.parse(body);
                    }

                    console.log(response);
                    console.log(body);
                });

            });

            //response.redirect(url);
        });
    });
};