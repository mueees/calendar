var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    configuration = require('configuration'),
    OauthRequest = require('common/request/oauth'),
    _ = require('underscore');

var controller = {
    auth: function (request, response, next) {
        var data = request.body;

        if (!validator.isLength(data.applicationId, 1)) {
            return next(new HttpError(400, "Invalid application Id"));
        }

        data.userId = request.user._id;

        OauthRequest.auth(data)
            .then(function (res) {
                var redirectHost = (request.production) ? 'http://proxy.mue.in.ua' : 'http://localhost:' + configuration.get('applications:proxy:services:web:port');

                response.send({
                    redirectUrl: redirectHost + '/oauth/' + data.applicationId + '?ticket=' + res.body
                });
            }, function (res) {
                log.error(res.body.message);

                next(new HttpError(400, res.body.message));
            });
    }
};

module.exports = controller;