var validator = require('validator'),
    Permission = require('common/resources/permission'),
    Application = require('common/resources/application'),
    OauthError = require('./OauthError'),
    _ = require('underscore'),
    log = require('common/log')(module),
    expiredTime = 1000*60*3, // 3 minutes
    async = require('async');
function Server() {
}

_.extend(Server.prototype, {
    auth: auth,
    refresh: refresh,
    exchange: exchange,
    createApplication: createApplication,
    removeApplication: removeApplication,
    getAllApplications: getAllApplications,
    getApplicationByApplicationId: getApplicationByApplicationId,
    getApplicationByOauthKey: getApplicationByOauthKey,
    getPermissionByAccessToken: getPermissionByAccessToken
});

function auth(data, callback) {
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
}

function exchange(data, callback) {
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
            exchange: expiredTime
        });
    });
}

function refresh(data, callback) {
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
            exchange: expiredTime
        });
    });

}

function getPermissionByAccessToken(access_token, callback) {
    if (!access_token) {
        return callback(new OauthError(400, "Invalid Access Token"));
    }

    Permission.findOne({
        access_token: access_token
    }, null, function (err, permission) {
        if (err) {
            return callback(new OauthError(400, "Server error"));
        }

        if (!permission) {
            return callback(new OauthError(400, "Invalid Access Token."));
        }

        if (permission.isExpired(expiredTime)) {
            return callback(new OauthError(400, "Access token was expired. Please update it."));
        }

        callback(null, permission);
    });
}

function createApplication(data, callback) {
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
}

function getAllApplications(userId, callback) {
    if (!userId || !userId.length) {
        log.error('Invalid  user id');
        return callback(new OauthError(400, 'Invalid user Id'));
    }

    Application.find({
        userId: userId
    }, {
        _id: true,
        applicationId: true,
        date_create: true,
        description: true,
        domain: true,
        oauthKey: true,
        name: true,
        privateKey: true,
        redirectUrl: true,
        status: true
    }, function (err, applications) {
        if (err) {
            log.error(err);
            return callback(new OauthError(400, err));
        }

        callback(null, applications);
    });
}

function removeApplication(id, callback) {
    if (!id || !id.length) {
        return callback(new OauthError(400, 'Invalid d'));
    }

    Application.remove({
        _id: id
    }, function (err) {
        if (err) {
            return callback(new OauthError(400, "Server error"));
        }

        callback(null);
    });
}

function getApplicationByApplicationId(applicationId, callback) {
    if (!applicationId || !applicationId.length) {
        return callback(new OauthError(400, 'Invalid application Id'));
    }

    Application.findOne({
        applicationId: applicationId
    }, null, function (err, application) {
        if (err) {
            return callback(new OauthError(400, "Server error"));
        }

        if (!application) {
            return callback(new OauthError(400, "Cannot find application"));
        }

        callback(null, application);
    });
}

function getApplicationByOauthKey(oauthKey, callback) {
    if (!oauthKey || !oauthKey.length) {
        return callback(new OauthError(400, 'Invalid oauth key'));
    }

    Application.findOne({
        oauthKey: oauthKey
    }, null, function (err, application) {
        if (err) {
            return callback(new OauthError(400, "Server error"));
        }

        if (!application) {
            return callback(new OauthError(400, "Cannot find application"));
        }

        callback(null, application);
    });

}

module.exports = Server;