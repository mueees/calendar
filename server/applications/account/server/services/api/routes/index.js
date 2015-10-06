var Application = require('common/resources/application'),
    Permission = require('common/resources/permission'),
    OauthRequest = require('common/request/oauth'),
    User = require('common/resources/user'),
    log = require('common/log')(module),
    _ = require('underscore'),
    async = require('async'),
    HttpError = require('common/errors/HttpError');

module.exports = function (app) {
    app.get('/api/account/user', function (request, response, next) {
        var userId = request.userId;

        async.parallel([
            function (cb) {
                User.findOne({
                    _id: userId
                }, function (err, user) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (!user) {
                        return cb('Cannot find user');
                    }

                    cb(null, user);
                });
            },
            function (cb) {
                OauthRequest.getApplications({
                    userId: userId
                }).then(function (res) {
                    cb(null, res.body);
                }, function (res) {
                    cb(res.body.message);
                });
            }
        ], function (err, results) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, err));
            }

            var user = results[0],
                applications = results[1],
                apps = _.map(applications, function (app) {
                    return {
                        _id: app._id,
                        name: app.name,
                        status: app.status,
                        privateKey: app.privateKey,
                        date_create: app.date_create,
                        redirectUrl: app.redirectUrl,
                        description: app.description,
                        applicationId: app.applicationId
                    }
                });

            response.send({
                email: user.email,
                applications: apps
            });
        });
    });
};