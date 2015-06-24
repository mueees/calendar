var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    if (request.headers && request.headers.authorization) {
        var parts = request.headers.authorization.split(' ');

        if (parts.length == 2) {
            var scheme = parts[0]
                , credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                request.access_token = credentials;
                log.info('access_token: ' + request.access_token);

                next();
            } else {
                log.error('Invalid Bearer schema');
                next(new HttpError('Invalid Bearer schema'));
            }
        } else {
            log.error('Access token invalid');
            next(new HttpError('Access token invalid'));
        }
    }
};