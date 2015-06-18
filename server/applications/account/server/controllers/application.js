var async = require('async'),
    HttpError = require('common/errors/HttpError'),
    oauthClient = require('../clients/oauth'),
    _ = require("underscore");

var controller = {
    getById: function (request, response, next) {
        oauthClient.exec('getApplicationById', request.param("id"), function (err, application) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            if (application) {
                response.send({
                    applicationId: application.applicationId,
                    date_create: application.date_create,
                    description: application.description,
                    name: application.name,
                    privateKey: application.privateKey,
                    redirectUrl: application.redirectUrl,
                    status: application.status
                });
            } else {
                return next(new HttpError(400, "Cannot find application."));
            }
        });
    },

    getAll: function (request, response, next) {
        oauthClient.exec('getAllApplications', request.user._id, function (err, applications) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            var apps = _.map(applications, function (application) {
                return {
                    applicationId: application.applicationId,
                    date_create: application.date_create,
                    description: application.description,
                    name: application.name,
                    privateKey: application.privateKey,
                    redirectUrl: application.redirectUrl,
                    status: application.status
                }
            });

            response.send(apps);
        });
    },

    create: function (request, response, next) {
        var data = request.body;

        if (!data.name || !data.name.length) {
            return next(new HttpError(400, "Name should exists."));
        }

        data.userId = request.user._id;

        oauthClient.exec('createApplication', data, function (err, application) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            response.send(application);
        });
    },

    remove: function (request, response, next) {
        oauthClient.exec('removeApplication', applicationId, function (err) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            response.send({});
        });
    }
};

module.exports = controller;