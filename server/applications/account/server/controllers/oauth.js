var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    _ = require('underscore'),
    User = require('common/resources/user');

var controller = {
    auth: function (request, response, next) {
        var data = request.body;

        if (!validator.isLength(data.publicKey, 1)) {
            return next(new HttpError(400, "Invalid public key"));
        }

        async.waterfall([
                function (cb) {
                    User.getApplicationByPublicKey(data.publicKey, cb);
                },
                function (application, cb) {
                    if (!application) {
                        cb('Cannot find application');
                    } else {
                        var grant = _.find(application.grants, function (grant) {
                            return grant.userId == request.user._id
                        });

                        if (grant) {
                            grant.access_token = '';
                            grant.refrsh_token = '';
                            grant.expired = '';
                            grant.auth_code = {
                                code: 'test',
                                isExchanged: false
                            };
                        } else {
                            application.grants.push({
                                userId: request.user._id,
                                auth_code: {
                                    code: 'test',
                                    isExchanged: false
                                },
                                access_token: '',
                                refresh_token: '',
                                expired: new Date()
                            });
                        }

                        application.save(function (err) {
                            if (err) {
                                return cb('Server error');
                            }

                            cb(null, application);
                        });
                    }
                }
            ],
            function (err, application) {
                if (err) {
                    return next(new HttpError(400, err));
                }

                response.redirect(application.redirectUrl);
            }
        );
    },

    exchange: function (request, response, next) {
        var data = request.body;

        if (!validator.isLength(data.auth_code, 1)) {
            return next(new HttpError(400, "Cannot find auth code"));
        }

        if (!validator.isLength(data.privateKey, 1)) {
            return next(new HttpError(400, "Cannot find private key"));
        }

        async.waterfall([
            function (cb) {
                User.getApplicationByPrivateKey(data.privateKey, cb);
            },
            function (application, cb) {
                if (!application) {
                    cb('Invalid private key');
                } else {
                    cb(null, application);
                }
            },
            function (application, cb) {
                var grant = _.find(application.grants, function (grant) {
                    return grant.auth_code.code == data.auth_code;
                });

                if (!grant) {
                    cb('You do not have permit for this user');
                } else {
                    if (grant.auth_code.isExchanged) {
                        cb('Auth code was already exchanged');
                    } else {
                        grant.auth_code.isExchanged = true;
                        grant.access_token = 'access';
                        grant.refresh_token = 'refresh';
                        grant.exchanged = new Date();

                        grant.save(function (err) {
                            if (err) {
                                return cb('Server error');
                            }

                            cb(null, grant);
                        });
                    }
                }
            }
        ], function (err, grant) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send({
                access_token: grant.access_token,
                refresh_token: grant.refresh_token,
                expired: 3600
            });
        });
    },

    refresh: function (request, response, next) {
        var data = request.body;

        if (!validator.isLength(data.refresh_token, 1)) {
            return next(new HttpError(400, "Cannot find refresh token"));
        }

        if (!validator.isLength(data.privateKey, 1)) {
            return next(new HttpError(400, "Cannot find private key"));
        }

        async.waterfall([
            function (cb) {
                User.getApplicationByPrivateKey(data.privateKey, cb);
            },
            function (application, cb) {
                if (!application) {
                    cb('Cannot find application');
                } else {
                    var grant = _.find(application.grants, function (grant) {
                        return grant.refresh_token == data.refresh_token;
                    });

                    if (!grant) {
                        cb('You do not have permit for this user');
                    } else {
                        grant.access_token = 'access2';

                        grant.save(function (err) {
                            if (err) {
                                return cb('Server error');
                            }

                            cb(null, grant);
                        });
                    }
                }
            }
        ], function (err, grant) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send({
                access_token: grant.access_token,
                expired: 3600
            });
        });
    }
};

module.exports = controller;