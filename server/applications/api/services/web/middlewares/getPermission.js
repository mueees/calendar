var oauth = require('../../../clients/oauth'),
    log = require('common/log')(module),
    HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    log.info("Get permission");

    oauth.exec('getPermissionByAccessToken', request.access_token, function (err, permission) {
        if (err) {
            log.error(err.message);
            return next(new HttpError(400, err));
        }

        log.error("Got permission");

        request.permission = permission;

        next();
    });
};