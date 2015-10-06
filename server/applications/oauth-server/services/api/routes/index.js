var Application = require('common/resources/application'),
    Permission = require('common/resources/permission'),
    log = require('common/log')(module),
    async = require('async'),
    HttpError = require('common/errors/HttpError');

var expiredTime = 1000 * 60 * 3 * 100000000000000000000000000000000000000000000000, // 3 minutes
    prefix = '/api/oauth';

module.exports = function (app) {
    // create application
    app.put(prefix + '/applications', function (request, response, next) {
        var data = request.body;

        if (!data.name || !data.name.length) {
            return next(new HttpError(400, 'Name should exist'));
        }

        if (!data.userId || !data.userId.length) {
            return next(new HttpError(400, "User Id should exists."));
        }

        if (!data.useProxy && !data.redirectUrl) {
            return next(new HttpError(400, "Redirect url should exists."));
        }

        Application.create(data, function (err, application) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send({
                _id: application._id,
                name: application.name,
                applicationId: application.applicationId,
                privateKey: application.privateKey,
                oauthKey: application.oauthKey,
                date_create: application.date_create,
                description: application.description
            });
        });
    });

    // edit application
    app.post(prefix + '/applications/:id', function (request, response, next) {
        var data = request.body;

        Application.update({
            _id: request.params.id
        }, data, function (err, application) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            response.send(application);
        });
    });

    // find applications by criteria
    app.get(prefix + '/applications', function (request, response, next) {
        Application.find(request.query, {
            _id: true,
            applicationId: true,
            date_create: true,
            description: true,
            domain: true,
            oauthKey: true,
            name: true,
            privateKey: true,
            useProxy: true,
            redirectUrl: true,
            status: true
        }, function (err, applications) {
            if (err) {
                log.error(err.message);

                return next(new HttpError(400, 'Server Error'));
            }

            response.send(applications);
        });
    });

    // get application by applicationId
    app.get(prefix + '/applications/applicationId/:id', function (request, response, next) {
        Application.findOne({
            applicationId: request.params.id
        }, null, function (err, application) {
            if (err) {
                return next(new HttpError(400, "Server error"));
            }

            if (!application) {
                return next(new HttpError(400, "Cannot find application"));
            }

            response.send(application);
        });
    });

    // get application by oauthKey
    app.get(prefix + '/applications/oauthKey/:oauthKey', function (request, response, next) {
        Application.findOne({
            oauthKey: request.params.oauthKey
        }, null, function (err, application) {
            if (err) {
                return next(new HttpError(400, "Server error"));
            }

            if (!application) {
                return next(new HttpError(400, "Cannot find application"));
            }

            response.send(application);
        });
    });

    // delete application
    app.delete(prefix + '/applications/:id', function (request, response, next) {
        Application.findOne({
            _id: request.params.id
        }, null, function (err, application) {
            if (err) {
                log.error("Server error");

                return next(new HttpError(400, "Server error"));
            }

            if (application) {
                async.parallel([
                    function (cb) {
                        // remove application
                        Application.remove({
                            _id: request.params.id
                        }, function (err) {
                            if (err) {
                                return cb("Server error");
                            }

                            cb();
                        });
                    },
                    function (cb) {
                        // remove all permissions
                        Permission.remove({
                            applicationId: application.applicationId
                        }, function (err) {
                            if (err) {
                                return cb("Server error");
                            }

                            cb();
                        });
                    }
                ], function (err) {
                    if (err) {
                        log.error(err);

                        return next(new HttpError('err'));
                    }

                    response.send();
                });
            } else {
                log.error("Cannot find application");

                return next(new HttpError(400, "Cannot find application"));
            }
        });
    });

    // generate permission with ticket, that client has to exchange
    app.post(prefix + '/auth', function (request, response, next) {
        var data = request.body;

        if (!data.applicationId || !data.applicationId.length) {
            return next(new HttpError(400, 'Invalid application Id'));
        }

        if (!data.userId || !data.userId.length) {
            return next(new HttpError(400, 'Invalid user Id'));
        }

        async.waterfall([
            function (cb) {
                Application.findOne({
                    applicationId: data.applicationId
                }, function (err, application) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (!application) {
                        return cb('Cannot find application');
                    }

                    if (application.status == 400) {
                        return cb('Application was blocked');
                    }

                    cb(null, application);
                });
            },
            function (application, cb) {
                Permission.remove({
                    userId: data.userId
                }, function (err) {
                    if (err) {
                        return cb('Server error');
                    }

                    cb(null, application);
                });
            },
            function (application, cb) {
                Permission.create({
                    userId: data.userId,
                    applicationId: application.applicationId
                }, function (err, permission) {
                    if (err) {
                        return cb('Server error');
                    }

                    cb(null, permission);
                });
            }
        ], function (err, permission) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send(permission.ticket);
        });
    });

    // exchange ticket to token
    app.post(prefix + '/exchange', function (request, response, next) {
        var data = request.body;

        if (!data.ticket) {
            return next(new HttpError(400, "Invalid ticket"));
        }

        if (!data.privateKey) {
            return next(new HttpError(400, "Invalid private key"));
        }

        if (!data.applicationId) {
            return next(new HttpError(400, "Invalid application id"));
        }

        async.waterfall([
            function (cb) {
                Application.findOne({
                    privateKey: data.privateKey,
                    applicationId: data.applicationId
                }, null, function (err, application) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (!application) {
                        return cb('Invalid application id or secret key');
                    }

                    cb(null, application);
                });
            },
            function (application, cb) {
                Permission.findOne({
                    ticket: data.ticket,
                    applicationId: data.applicationId
                }, null, function (err, permission) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (!permission) {
                        return cb('Invalid ticket or application id');
                    }

                    if (permission.isTicketExchanged) {
                        return cb('Ticket was already exchanged');
                    }

                    cb(null, application, permission);
                });
            },
            function (application, permission, cb) {
                permission.exchangeTicketToTokens(function (err) {
                    if (err) {
                        return cb("Server error");
                    }

                    cb(null, permission);
                });
            }
        ], function (err, permission) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send({
                access_token: permission.access_token,
                refresh_token: permission.refresh_token,
                exchange: expiredTime
            });
        });
    });

    // refresh access token by refresh token
    app.post(prefix + '/refresh', function (request, response, next) {
        var data = request.body;

        if (!data.privateKey) {
            return next(new HttpError(400, "Invalid private key"));
        }

        if (!data.refresh_token) {
            return next(new HttpError(400, "Invalid refresh token"));
        }

        if (!data.applicationId) {
            return next(new HttpError(400, "Invalid application id"));
        }

        async.waterfall([
            function (cb) {
                Application.findOne({
                    privateKey: data.privateKey,
                    applicationId: data.applicationId
                }, null, function (err, application) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (!application) {
                        return cb('Invalid application id or secret key');
                    }

                    cb(null, application);
                });
            },
            function (application, cb) {
                Permission.findOne({
                    refresh_token: data.refresh_token,
                    applicationId: data.applicationId
                }, null, function (err, permission) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (!permission) {
                        return cb('Invalid refresh token or application id');
                    }

                    cb(null, application, permission);
                });
            },
            function (application, permission, cb) {
                permission.refreshToken(function (err) {
                    if (err) {
                        return cb("Server error");
                    }

                    cb(null, permission);
                });
            }
        ], function (err, permission) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send({
                access_token: permission.access_token,
                exchange: expiredTime
            });
        });
    });

    // update application private key
    app.post(prefix + '/applications/:id/command/newPrivateKey', function (request, response, next) {
        Application.refreshPrivateKey(request.params.id, function (err, newPrivateKey) {
            if (err) {
                log.error(err);

                return next(new HttpError(400, err));
            }

            response.send(newPrivateKey)
        });
    });

    // get permission by accessToken
    app.get(prefix + '/permissions/accessToken/:accessToken', function (request, response, next) {
        Permission.findOne({
            access_token: request.params.accessToken,
        }, null, function (err, permission) {
            if (err) {
                return next(new HttpError(400, "Server error"));
            }

            if (!permission) {
                return next(new HttpError(400, "Invalid Access Token."));
            }

            if (permission.isExpired(expiredTime)) {
                return next(new HttpError(400, "Access token was expired. Please update it."));
            }

            response.send(permission);
        });
    });
};