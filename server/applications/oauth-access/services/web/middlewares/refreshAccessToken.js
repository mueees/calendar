var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    var token = request.user;

    if (token.isNeedRefresh()) {
        token.refreshAccessToken(function (err, token) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            request.user = token;
            next();
        });
    } else {
        next();
    }
};