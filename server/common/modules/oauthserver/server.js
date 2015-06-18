var validator = require('validator'),
    Permission = require('common/resources/permission'),
    Application = require('common/resources/application'),
    OauthError = require('./OauthError'),
    _ = require('underscore'),
    async = require('async');

function Server() {
}

Server.prototype.auth = function (data, callback) {
    if (!data.applicationId || !data.applicationId.length) {
        return callback(new OauthError(400, 'Invalid application Id'));
    }

    if (!data.userId || !data.userId.length) {
        return callback(new OauthError(400, 'Invalid user Id'));
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
            return callback(new OauthError(400, err));
        }

        callback(null, permission.ticket);
    });
};

Server.prototype.exchange = function (data, callback) {
    if (!data.ticket || !data.ticket.length) {
        return callback(new OauthError(400, "Invalid ticket"));
    }

    if (!data.privateKey || !data.privateKey.length) {
        return callback(new OauthError(400, "Invalid private key"));
    }

    if (!data.applicationId || !data.applicationId.length) {
        return callback(new OauthError(400, "Invalid application id"));
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
            return callback(new OauthError(400, err));
        }

        callback(null, {
            access_token: permission.access_token,
            refresh_token: permission.refresh_token,
            exchange: 3600
        });
    });
};

Server.prototype.refresh = function (data, callback) {
    if (!data.privateKey) {
        return callback(new OauthError(400, "Invalid private key"));
    }

    if (!data.refresh_token) {
        return callback(new OauthError(400, "Invalid refresh token"));
    }

    if (!data.applicationId || !data.applicationId.length) {
        return callback(new OauthError(400, "Invalid application id"));
    }

    async.waterfall([
        function (cb) {
            // todo: this is legacy code, need move to model method

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
            return callback(new OauthError(400, err));
        }

        callback(null, {
            access_token: permission.access_token,
            exchange: 3600
        });
    });

};

Server.prototype.createApplication = function (data, callback) {
    if (!data.name || !data.name.length) {
        return callback(new OauthError(400, "Name should exists."));
    }

    if (!data.userId || !data.userId.length) {
        return callback(new OauthError(400, "User Id should exists."));
    }

    Application.create(data, function (err, application) {
        if (err) {
            return callback(new OauthError(400, err));
        }

        callback(null, {
            name: application.name,
            applicationId: application.applicationId,
            privateKey: application.privateKey,
            oauthKey: application.oauthKey,
            date_create: application.date_create,
            description: application.description
        });
    });
};

Server.prototype.getAllApplications = function (userId, callback) {
    if (!userId || !userId.length) {
        return callback(new OauthError(400, 'Invalid user Id'));
    }

    Application.find({
        userId: userId
    }, {
        _id: true,
        applicationId: true,
        date_create: true,
        description: true,
        name: true,
        privateKey: true,
        redirectUrl: true,
        status: true
    }, function (err, applications) {
        if (err) {
            return callback(new OauthError(400, err));
        }

        callback(null, applications);
    });
};

Server.prototype.removeApplication = function (applicationId, callback) {
    if (!applicationId || !applicationId.length) {
        return callback(new OauthError(400, 'Invalid application Id'));
    }

    Application.remove({
        _id: applicationId
    }, function (err) {
        if (err) {
            return callback(new OauthError(400, "Server error"));
        }

        callback(null);
    });
};

Server.prototype.getApplicationById = function (applicationId, callback) {
    if (!applicationId || !applicationId.length) {
        return callback(new OauthError(400, 'Invalid application Id'));
    }

    Application.findOne({
        _id: applicationId
    }, null, function (err, application) {
        if (err) {
            return next(new OauthError(400, "Server error"));
        }

        callback(null, application);
    });
};

module.exports = Server;