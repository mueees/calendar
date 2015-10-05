var oauth = require('../../../clients/oauth'),
    log = require('common/log')(module),
    OauthRequest = require('common/request/oauth'),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    OauthRequest.getPermissionByAccessToken(request.access_token).then(function (res) {
        request.permission = res.body;
        next();
    }, function (res) {
        log.error(res.body.message);
        return next(new HttpError(400, res.body.message));
    });
};