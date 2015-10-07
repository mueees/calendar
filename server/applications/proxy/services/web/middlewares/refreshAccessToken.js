var HttpError = require('common/errors/HttpError'),
    OauthRequest = require('common/request/oauth'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    var oauthAccess = request.user;

    if (oauthAccess.isNeedRefresh()) {
        OauthRequest.refresh({
            refresh_token: oauthAccess.refresh_token,
            privateKey: oauthAccess.privateKey,
            applicationId: oauthAccess.applicationId
        }).then(function (res) {
            oauthAccess.last_refresh = new Date();
            oauthAccess.access_token = res.body.access_token;
            oauthAccess.expired = res.body.expired;

            request.user = oauthAccess;
            next();

            oauthAccess.save(function (err) {
                if (err) {
                    log.error(err);
                }
            });

        }, function (res) {
            log.error(res.body.message);

            return next(new HttpError(400, 'Cannot refresh token'));
        });
    } else {
        next();
    }
};