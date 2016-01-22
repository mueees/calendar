var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    var error;

    if (!request.isInternalRequest) {
        if (!request.user) {
            error = 'You do not have access to this API';
        }
    }

    if (error) {
        log.error(error);

        next(new HttpError(401, error));
    } else {
        next();
    }
};