var HttpError = require('common/errors/HttpError'),
    clients = {
        test: require('../../../clients/test')
    };

module.exports = function (request, response, next) {
    var data = {
        userId: request.permission.userId
    };

    if (request.method == 'get') {
        data.request = request.query;
    }

    if (request.method == 'port') {
        data.data = request.body;
    }

    data.originalUrl = request.originalUrl;

    clients[request.application].exec('request', request.params[0], data, function (err, data) {
        if (err) {
            return next(new HttpError(400, err.message));
        }

        response.send(data);
    });
};