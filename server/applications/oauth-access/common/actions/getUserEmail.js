var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    log = require('common/log')(module),
    ApiRequestToProxy = require('./ApiRequestToProxy');

function GetUserEmail(access_token) {
    this.initialize(access_token);
}

util.inherits(GetUserEmail, ApiRequestToProxy);

_.extend(GetUserEmail.prototype, {
    initialize: function (access_token) {
        var data = {
            application: 'account',
            request: 'user',
            access_token: access_token,
            method: 'GET'
        };

        ApiRequestToProxy.prototype.initialize.apply(this, [data]);
    },

    execute: function (callback) {
        ApiRequestToProxy.prototype.execute.apply(this, [function (err, data) {
            if (err) {
                log.error(err.message);
                callback(err);
            }

            callback(null, data.email);
        }]);
    }
});

module.exports = GetUserEmail;