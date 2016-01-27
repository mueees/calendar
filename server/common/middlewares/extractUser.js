var HttpError = require('common/errors/HttpError'),
    AccountRequest = require('common/request/account'),
    log = require('common/log')(module);

module.exports = function (request, response, next) {
    if (request.headers.userid) {
        request.userId = request.headers.userid;

        AccountRequest.getUser({
            userId: request.headers.userid
        }).then(function (data) {
            request.user = data.body;

            next();
        }, function (err) {
            log.error(err.body.message);

            next();
        });
    } else {
        next();
    }
};