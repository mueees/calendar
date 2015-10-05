var ServerError = require('common/service').ServerError,
    User = require('common/resources/user'),
    OauthRequest = require('common/request/oauth'),
    log = require('common/log')(module),
    _ = require('underscore'),
    async = require('async');

module.exports = function (server) {
    server.addRoute('/user', function (data, callback) {
        if (!data.userId) {
            log.error('Cannot find user id');
            return callback(new ServerError(400, 'Cannot find user id'));
        }

        async.parallel([
            function (cb) {
                User.findOne({
                    _id: data.userId
                }, function (err, user) {
                    if (err) {
                        log.error(err);
                        return cb('Server error');
                    }

                    if (!user) {
                        log.error('Cannot find user');
                        return cb('Cannot find user');
                    }

                    cb(null, user);
                });
            },
            function (cb) {
                OauthRequest.getApplications({
                    userId: data.userId
                }).then(function (res) {
                    cb(null, res.body);
                }, function (res) {
                    cb('Server error');
                });
            }
        ], function (err, results) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, err));
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

            callback(null, {
                email: user.email,
                applications: apps
            });
        });
    });
};