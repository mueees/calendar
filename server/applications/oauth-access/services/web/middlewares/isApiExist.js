/*
 * Determinate if api client exist and has active status
 * */

var applicationsApi = require('configuration').get('applications-api'),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    var application = request.params.application,
        applicationApi = applicationsApi[application];

    if (!applicationApi) {
        return next(new HttpError(400, 'Application "' + application + '" is not exist.'));
    }

    if (!applicationApi.status) {
        return next(new HttpError(400, application + " offline."));
    }

    request.application = application;

    next();
};