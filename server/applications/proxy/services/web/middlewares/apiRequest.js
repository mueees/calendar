var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    clients = {
        account: require('../../../clients/account'),
        test: require('../../../clients/test')
    };

module.exports = function (request, response, next) {
    var data = {
        userId: request.permission.userId
    };

    if (request.method == 'get') {
        data.data = request.query;
    }

    if (request.method == 'port') {
        data.data = request.body;
    }

    data.originalUrl = request.originalUrl;

    log.info('request params:');
    log.info(data);

    log.info('resource');
    log.info(request.params[0]);

    clients[request.application].exec('request', '/' + request.params[0], data, function (err, data) {
        if (err) {
            log.error(err.message);
            return next(new HttpError(400, err.message));
        }

        response.send(data);
    });
};