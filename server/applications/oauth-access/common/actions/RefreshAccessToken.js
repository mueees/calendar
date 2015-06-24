var BaseAction = require('common/actions/base'),
    oauthClient = require('../../clients/oauth'),
    util = require('util'),
    log = require('common/log')(module),
    _ = require('underscore');

function RefreshAccessToken(data) {
    this.initialize(data);
}

util.inherits(RefreshAccessToken, BaseAction);


_.extend(RefreshAccessToken.prototype, {
    initialize: function (data) {
        this.refresh_token = data.refresh_token;
        this.privateKey = data.privateKey;
        this.applicationId = data.applicationId;
    },

    execute: function (callback) {
        oauthClient.exec('refresh', {
            refresh_token: this.refresh_token,
            privateKey: this.privateKey,
            applicationId: this.applicationId
        }, function (err, data) {
            if (err) {
                log.error(err.message);
                callback(err);
            }

            callback(null, data);
        });
    }
});

module.exports = RefreshAccessToken;