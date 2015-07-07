var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    log.info('Got request');
    log.info('Application: ' + request.params.application);

    next();
};