var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    configuration = require("configuration"),
    _ = require("underscore"),
    User = require('common/resources/user'),
    Application = require('common/resources/application');

var controller = {
    getById: function (request, response, next) {
        Application.find({
            _id: request.param("id")
        }, null, function (err, application) {
            if (err) {
                return next(new HttpError(400, "Server error"));
            }

            if (application) {
                response.send(application);
            } else {
                return next(new HttpError(400, "Cannot find application."));
            }
        });
    },

    getAll: function (request, response, next) {
        Application.find({
            userId: request.user._id
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
                return next(new HttpError(400, err));
            }

            response.send(applications);
        });
    },

    create: function (request, response, next) {
        var data = request.body;

        if (!data.name || !data.name.length) {
            return next(new HttpError(400, "Name should exists."));
        }

        data.userId = request.user._id;

        Application.create(data, function (err, application) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send(application);
        });
    },

    remove: function (request, response, next) {
        Application.remove({
            _id: request.param("id")
        }, function (err) {
            if (err) {
                return next(new HttpError(400, "Server error"));
            }

            response.send({});
        });
    }
};

module.exports = controller;