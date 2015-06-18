var HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    if (request.headers && request.headers.authorization) {
        var parts = request.headers.authorization.split(' ');

        if (parts.length == 2) {
            var scheme = parts[0]
                , credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                request.access_token = credentials;

                next();
            } else {
                next(new HttpError('Invalid Bearer schema'));
            }
        } else {
            next(new HttpError('Access token invalid'));
        }
    }
};