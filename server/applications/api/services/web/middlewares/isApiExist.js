var applicationsApi = require('configuration').get('applications-api'),
    log = require('common/log')(module),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    var application = request.params.application,
        applicationApi = applicationsApi[application];

    if (!applicationApi) {
        log.error('Application "' + application + '" is not exist.');
        return next(new HttpError(400, 'Application "' + application + '" is not exist.'));
    }

    if (!applicationApi.status) {
        log.error(application + " offline.");
        return next(new HttpError(400, application + " offline."));
    }

    request.application = application;

    next();
};