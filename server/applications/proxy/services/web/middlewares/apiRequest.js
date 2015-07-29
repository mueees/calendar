var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    ApiRequestToProxy = require('../../../common/actions/ApiRequestToProxy');

module.exports = function (request, response, next) {
    var options = {
        application: request.params.application,
        request: request.params[0],
        access_token: request.user.access_token,
        method: request.method
    };

    if (options.method == 'POST') {
        options.data = request.body;
    }

    (new ApiRequestToProxy(options)).execute(function (err, data) {
        if (err) {
            log.error(err);
            return next(new HttpError(400, err.message));
        }

        response.send(data);
    });
};