var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    ApiRequestToProxy = require('../../../common/actions/ApiRequestToProxy');

module.exports = function (request, response, next) {
    var data = {
        application: request.params.application,
        request: request.params[0],
        access_token: request.user.access_token,
        method: request.method
    };

    if (data.method == 'port') {
        data.data = request.body;
    }

    (new ApiRequestToProxy(data)).execute(function (err, data) {
        if (err) {
            log.error(err);
            return next(new HttpError(400, err.message));
        }

        response.send(data);
    });
};