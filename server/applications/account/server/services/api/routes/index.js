var ServerError = require('common/service').ServerError,
    User = require('common/resources/user'),
    oauthClient = require('../../../clients/oauth'),
    log = require('common/log')(module),
    async = require('async');

module.exports = function (server) {
    server.addRoute('/user', function (data, callback) {
        log.info('Account api: /user request');

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
                oauthClient.exec('getAllApplications', data.userId, function (err, applications) {
                    if (err) {
                        log.error(err);
                        return cb('Server error');
                    }

                    cb(null, applications);
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