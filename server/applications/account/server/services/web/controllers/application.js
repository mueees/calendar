var async = require('async'),
    HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    configuration = require("configuration"),
    OauthRequest = require('common/request/oauth'),
    _ = require("lodash");

var controller = {
    getByApplicationId: function (request, response, next) {
        OauthRequest
            .getApplicationByApplicationId(request.params.id)
            .then(function (res) {
                var application = res.body;

                response.send({
                    _id: application._id,
                    name: application.name,
                    status: application.status,
                    date_create: application.date_create,
                    redirectUrl: application.redirectUrl,
                    description: application.description,
                    applicationId: application.applicationId,
                    auth: _.contains(configuration.get('whiteAppList'), application.applicationId)
                });
            }, function (response) {
                log.error(response.body.message);

                next(new HttpError(400, response.body.message));
            });
    },

    getAll: function (request, response, next) {
        OauthRequest.getApplications({
            userId: request.user._id
        }).then(function (res) {
            var apps = _.map(res.body, function (application) {
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
        }, function (response) {
            log.error(response.body.message);
            next(new HttpError(400, response.body.message));
        });
    },

    create: function (request, response, next) {
        var data = request.body;

        if (!data.name) {
            return next(new HttpError(400, "Name should exists."));
        }

        if (!data.useProxy && !data.redirectUrl) {
            return next(new HttpError(400, "Redirect url should exists."));
        }

        data.userId = request.user._id;

        OauthRequest.createApplication(data).then(function (res) {
            response.send(res.body);
        }, function (response) {
            log.error(response.body.message);

            next(new HttpError(400, response.body.message));
        });
    },

    edit: function (request, response, next) {
        var data = request.body,
            edit = {};

        if (!data._id) {
            return next(new HttpError(400, "Cannot find id."));
        }

        edit._id = data._id;

        if (data.name) {
            edit.name = data.name;
        }

        if (data.domain) {
            edit.domain = data.domain;
        }

        if (data.description) {
            edit.description = data.description;
        }

        if (!Object.keys(edit).length) {
            return next(new HttpError(400, "Cannot find parameters for chnging."));
        }

        OauthRequest.editApplication(data).then(function (res) {
            response.send(res.body);
        }, function (response) {
            log.error(response.body.message);

            next(new HttpError(400, response.body.message));
        });
    },

    newPrivateKey: function (request, response, next) {
        var data = request.body;

        if (!data.applicationId) {
            return next(new HttpError(400, "Application Id should exists."));
        }

        OauthRequest.newPrivateKey({_id: data.applicationId})
            .then(function (res) {
                response.send({
                    privateKey: res.body
                });
            }, function (response) {
                log.error(response.body.message);

                next(new HttpError(400, response.body.message));
            });
    },

    remove: function (request, response, next) {
        var data = request.body;

        if (!data._id) {
            return next(new HttpError(400, "Application id should exists."));
        }

        OauthRequest.deleteApplication({_id: data._id})
            .then(function () {
                response.send({});
            }, function (response) {
                log.error(response.body.message);

                next(new HttpError(400, response.body.message));
            });
    }
};

module.exports = controller;