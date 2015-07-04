var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    log = require('common/log')(module),
    path = require('path'),
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
        var options = {
            url: 'http://' + path.normalize('localhost:6005/api/' + this.application + '/' + this.request),
            headers: {
                'Authorization': 'Bearer ' + this.access_token,
                'X-Requested-With': 'XMLHttpRequest'
            },
            method: this.method
        };

        // add post data for POST request
        if (this.method == 'POST' && this.data) {
            options.postData = {};
            options.postData.params = this.data;
            options.headers['content-type'] = 'application/x-www-form-urlencoded';
        }

        request(options, function (err, response, data) {
            if (err) {
                log.error(err.message);
                callback(err);
            }

            callback(null, JSON.parse(data));
        });
    }
});

module.exports = ApiRequestToProxy;