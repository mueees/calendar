var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    _ = require('underscore'),
    clients = {
        account: require('../../../clients/account'),
        calendar: require('../../../clients/calendar')
    };

module.exports = function (request, response, next) {
    var options = {
        userId: request.permission.userId
    };

    if (request.method == 'GET') {
        options.data = request.query;
    }

    if (request.method == 'POST') {
        options.data = request.body;
    }

    options.originalUrl = request.originalUrl;

    clients[request.application].exec('request', '/' + request.params[0], options, function (err, data) {
        if (err) {
            log.error(err.message);
            return next(new HttpError(400, err.message));
        }

        if (_.isString(data)) {
            data = {
                data: data
            }
        }

        response.send(data);
    });
};