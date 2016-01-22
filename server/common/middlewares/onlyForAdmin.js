var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    var error;

    if (!request.isInternalRequest) {
        if (!request.user) {
            error = 'You do not have access to this API. Cannot find user.';
        } else if (request.user.group != 'admin') {
            error = 'You do not have access to this API. You stay in user group.'
        }
    }

    if (error) {
        log.error(error);

        next(new HttpError(401, error));
    } else {
        next();
    }
};