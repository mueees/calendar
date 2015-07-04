var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    oauthClient = require('../../../clients/oauth'),
    configuration = require('configuration'),
    _ = require('underscore');

var controller = {
    auth: function (request, response, next) {
        var data = request.body;

        if (!validator.isLength(data.applicationId, 1)) {
            return next(new HttpError(400, "Invalid application Id"));
        }

        data.userId = request.user._id;

        oauthClient.exec('auth', data, function (err, ticket) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            response.send({
                redirectUrl: 'http://localhost:' + configuration.get('applications:proxy:services:web:port') +
                '/oauth/' + data.applicationId + '?ticket=' + ticket
            });
        });
    },

    exchange: function (request, response, next) {
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

        oauthClient.exec('exchange', data, function (err, tokens) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            response.send(tokens);
        });
    },

    refresh: function (request, response, next) {
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

        oauthClient.exec('refresh', data, function (err, tokens) {
            if (err) {
                return next(new HttpError(400, err.message));
            }

            response.send(tokens);
        });
    }
};

module.exports = controller;