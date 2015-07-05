var async = require('async'),
    HttpError = require('common/errors/HttpError'),
    oauthClient = require('../../../clients/oauth'),
    _ = require("underscore");

var controller = {
    getByApplicationId: function(request, response, next){
        oauthClient.exec('getApplicationByApplicationId', request.param("id"), function (err, application) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            if (application) {
                response.send({
                    _id: application._id,
                    name: application.name,
                    status: application.status,
                    privateKey: application.privateKey,
                    date_create: application.date_create,
                    redirectUrl: application.redirectUrl,
                    description: application.description,
                    applicationId: application.applicationId
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
                    _id: application._id,
                    applicationId: application.applicationId,
                    date_create: application.date_create,
                    description: application.description,
                    domain: application.domain,
                    oauthKey: application.oauthKey,
                    name: application.name,
                    privateKey: application.privateKey,
                    redirectUrl: application.redirectUrl,
                    useProxy: application.useProxy,
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

        if(!data.useProxy && !data.redirectUrl){
            return next(new HttpError(400, "Redirect url should exists."));
        }

        data.userId = request.user._id;

        oauthClient.exec('createApplication', data, function (err, application) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            response.send(application);
        });
    },

    newPrivateKey: function (request, response, next) {
        var data = request.body;

        if (!data.applicationId) {
            return next(new HttpError(400, "Application Id should exists."));
        }

        oauthClient.exec('newPrivateKey', data.applicationId, function (err, newPrivateKey) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            response.send({
                newPrivateKey: newPrivateKey
            });
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