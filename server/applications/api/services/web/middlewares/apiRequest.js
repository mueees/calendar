var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    clients = {
        account: require('../../../clients/account'),
        calendar: require('../../../clients/calendar'),
        test: require('../../../clients/test')
    };

module.exports = function (request, response, next) {
    var options = {
        userId: request.permission.userId
    };

    if (request.method == 'get') {
        options.data = request.query;
    }

    if (request.method == 'port') {
        options.data = request.body;
    }

    options.originalUrl = request.originalUrl;

    clients[request.application].exec('request', '/' + request.params[0], options, function (err, data) {
        if (err) {
            log.error(err.message);
            return next(new HttpError(400, err.message));
        }

        response.send(data);
    });
};