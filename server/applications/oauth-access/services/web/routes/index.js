var oauthClient = require('../../../clients/oauth'),
    Token = require('../../../common/resources/token'),
    oauthAccessConfig = require('../../../config');

module.exports = function (app) {
    app.get('/provide/:oauthKey', function (request, response, next) {
        /*
         * 1. найти приложение по oauthKey, при этому проверить правильность домена
         * 2.
         * */
        oauthClient.exec('getApplicationByOauthKey', request.param.oauthKey, function (err, application) {
            if (err) {
                return response.redirect('/error/provide');
            }

            var url = oauthAccessConfig.get('approvalUrl') + 'applicationid=' + application.applicationId + '&redirect=' + application.redirectUrl;

            response.redirect(url);
        });
    });

    app.get('/oauth/:ticket', function (request, response, next) {
        oauthClient.exec('getApplicationByOauthKey', request.param.oauthKey, function (err, application) {
            if (err) {
                return response.redirect('/error/provide');
            }

            var url = oauthAccessConfig.get('approvalUrl') + 'applicationid=' + application.applicationId + '&redirect=' + application.redirectUrl;

            response.redirect(url);
        });
    });
};