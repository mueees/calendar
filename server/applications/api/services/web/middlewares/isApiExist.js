var applications = require('configuration').get('applications'),
    log = require('common/log')(module),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    var applicationApi = applications[request.params.application].services.api;

    if (!applicationApi) {
        log.error('Application "' + request.params.application + '" is not exist.');
        return next(new HttpError(400, 'Application "' + request.params.application + '" is not exist.'));
    }

    if (!applicationApi.status) {
        log.error(request.params.application + " offline.");
        return next(new HttpError(400, request.params.application + " offline."));
    }

    next();
};