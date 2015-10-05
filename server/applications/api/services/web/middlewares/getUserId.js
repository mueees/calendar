var log = require('common/log')(module),
    OauthRequest = require('common/request/oauth'),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    OauthRequest.getPermissionByAccessToken(request.access_token).then(function (res) {
        request.headers.userId = res.body.userId;
        next();
    }, function (res) {
        log.error(res.body.message);
        return next(new HttpError(400, res.body.message));
    });
};