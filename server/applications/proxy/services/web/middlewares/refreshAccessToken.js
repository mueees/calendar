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

            log.info('Access Token has refreshed.');

            token.last_refresh = new Date();
            request.user = token;
            next();

            token.save(function(err){
                if(err){
                    log.error(err);
                }
            });
        });
    } else {
        next();
    }
};