var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    var oauthAccess = request.user;

    if (oauthAccess.isNeedRefresh()) {
        oauthAccess.refreshAccessToken(function (err, oauthAccess) {
            if (err) {
                log.error(err);

                return next(new HttpError(400, 'Server error'));
            }

            oauthAccess.last_refresh = new Date();
            request.user = oauthAccess;

            next();

            oauthAccess.save(function (err) {
                if (err) {
                    log.error(err);
                }
            });
        });
    } else {
        next();
    }
};