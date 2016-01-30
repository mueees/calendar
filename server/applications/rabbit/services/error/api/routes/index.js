var log = require('common/log')(module),
    HttpError = require('common/errors/HttpError'),
    errorHelper = require('../../../../common/error/helper'),
    ErrorHandler = require('../../common/modules/error-handler'),
    internalRequests = require('common/middlewares/internal-requests'),
    Error = require('../../../../common/resources/error'),
    prefix = '/api/rabbit/error';

module.exports = function (app) {

    // save report about the error
    app.put(prefix + '/error', [internalRequests, function (request, response, next) {
        if (!errorHelper.isValidError(request.body)) {
            log.error('Invalid error');

            return next(new HttpError(400, 'Invalid error'));
        } else {
            response.send({});

            log.error('Error Code ' + request.body.errorCode + ' was reported');

            ErrorHandler.handle(request.body).then(function (error) {
            }, function (error) {
                log.error(error);
            });
        }
    }]);

    // return all feed errors
    app.get(prefix + '/error/feeds', [internalRequests, function (request, response, next) {
        Error.getAllFeedErrors().then(function (feedErrors) {
            response.send(feedErrors);
        }, function (err) {
            log.error(err);

            next(new HttpError(500, 'Server error'));
        });
    }]);
};