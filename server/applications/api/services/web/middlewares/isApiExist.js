var applications = require('configuration').get('applications'),
    log = require('common/log')(module),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    var service = applications[request.params.application].services.api;

    if (!service) {
        log.error('Application "' + request.params.application + '" is not exist.');

        return next(new HttpError(400, 'Application "' + request.params.application + '" is not exist.'));
    }

    if (!service.status) {
        log.error(request.params.application + " offline.");
        return next(new HttpError(400, request.params.application + " offline."));
    }

    request.service = service;

    next();
};