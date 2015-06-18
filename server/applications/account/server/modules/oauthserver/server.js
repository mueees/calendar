var validator = require('validator'),
    Permission = require('common/resources/permission'),
    Application = require('common/resources/application'),
    HttpError = require('common/errors/HttpError'),
    _ = require('underscore'),
    async = require('async');

function Server() {
}

Server.prototype.auth = function (request, response, next) {
    var data = request.body;

    if (!data.applicationId || !data.applicationId.length) {
        return next(new HttpError(400, "Invalid application Id"));
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
                userId: request.user._id
            }, function (err) {
                if (err) {
                    return cb('Server error');
                }

                cb(null, application);
            });
        },
        function (application, cb) {
            Permission.create({
                userId: request.user._id,
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

        response.send({
            ticket: permission.ticket
        });
    });
};

Server.prototype.exchange = function (request, response, next) {
    var data = request.body;

    if (!data.ticket || !data.ticket.length) {
        return next(new HttpError(400, "Invalid ticket"));
    }

    if (!data.privateKey || !data.privateKey.length) {
        return next(new HttpError(400, "Invalid private key"));
    }

    if (!data.applicationId || !data.applicationId.length) {
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
            exchange: 3600
        });
    });
};

Server.prototype.refresh = function (request, response, next) {
    var data = request.body;

    if (!data.privateKey) {
        return next(new HttpError(400, "Invalid private key"));
    }

    if (!data.refresh_token) {
        return next(new HttpError(400, "Invalid refresh token"));
    }

    if (!data.applicationId || !data.applicationId.length) {
        return next(new HttpError(400, "Invalid application id"));
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
            return next(new HttpError(400, err));
        }

        response.send({
            access_token: permission.access_token,
            exchange: 3600
        });
    });

};

module.exports = Server;