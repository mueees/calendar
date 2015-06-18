var HttpError = require('common/errors/HttpError'),
    clients = {
        test: require('../clients/test')
    };

module.exports = function (request, response, next) {
    var data = {
        userId: request.permission.userId,
        request: request.query('request'),
        body: request.body || null
    };

    clients[request.query('application')].exec('request', data, function (err, data) {
        if (err) {
            return next(new HttpError(400, err.message));
        }

        response.send(data);
    });
};