/*
 * Determinate if api client exist and has active status
 * */

var applicationsApi = require('configuration').get('applications-api'),
    HttpError = require('common/errors/HttpError');

module.exports = function (req, res, next) {
    var application = req.query('application'),
        applicationApi = applicationsApi[req.query('applicationName')];

    if (!applicationApi) {
        return next(new HttpError(400, application + " is not exist."));
    }

    if (!applicationApi.status) {
        return next(new HttpError(400, application + " offline."));
    }

    next();
};