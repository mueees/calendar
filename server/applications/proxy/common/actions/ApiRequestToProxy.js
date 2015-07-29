var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    log = require('common/log')(module),
    path = require('path'),
    configuration = require('configuration'),
    BaseAction = require('common/actions/base');

function ApiRequestToProxy(data) {
    this.initialize(data);
}

util.inherits(ApiRequestToProxy, BaseAction);

_.extend(ApiRequestToProxy.prototype, {
    initialize: function (options) {
        this.application = options.application;
        this.request = options.request;
        this.access_token = options.access_token;
        this.method = options.method;
        this.data = options.data;
    },

    execute: function (callback) {
        var url;

        if (process.env.NODE_ENV == "development") {
            url = 'localhost:' + configuration.get('applications:api:services:web:port') + '/api/';
        } else {
            url = 'api.mue.in.ua/api/';
        }

        // todo: check how works path.normalize with http or https ?
        var options = {
            url: 'http://' + path.normalize(url + this.application + '/' + this.request),
            headers: {
                'Authorization': 'Bearer ' + this.access_token,
                'X-Requested-With': 'XMLHttpRequest'
            },
            method: this.method
        };

        // add post data for POST request
        if (this.method == 'POST' && this.data) {
            options.json = true;
            options.body = this.data;
        }

        request(options, function (err, response, data) {
            if (err) {
                log.error(err.message);
                callback(err);
            }

            if (_.isString(data)) {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                }
            }

            if (response.statusCode == 400 || response.statusCode == 500) {
                var message = (data && data.message) ? data.message : 'Server error';

                callback(new Error(message));
            } else {
                callback(null, data);
            }
        });
    }
});

module.exports = ApiRequestToProxy;