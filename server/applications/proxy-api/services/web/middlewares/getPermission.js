var oauth = require('../../../clients/oauth'),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    oauth.exec('getPermissionByAccessToken', request.access_token, function (err, permission) {
        if (err) {
            return next(new HttpError(400, err));
        }

        request.permission = permission;

        next();
    });
};