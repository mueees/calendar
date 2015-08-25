var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    RefreshAccessToken = require('../actions/RefreshAccessToken'),
    beforeRefreshTime = 1000 * 30, // 30 seconds
    helpers = require('common/helpers');

var oauthAccessSchema = new Schema({
    applicationId: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        default: ''
    },
    refresh_token: {
        type: String,
        default: ''
    },
    exchange: {
        type: Number,
        required: true
    },
    last_refresh: {
        type: Date,
        default: new Date()
    },
    email: {
        type: String,
        required: true
    }
});

oauthAccessSchema.methods.isNeedRefresh = function () {
    return (new Date()).getTime() - this.last_refresh > this.exchange - beforeRefreshTime;
};

oauthAccessSchema.methods.refreshAccessToken = function (callback) {
    var me = this,
        refreshAction = new RefreshAccessToken({
            privateKey: this.privateKey,
            refresh_token: this.refresh_token,
            applicationId: this.applicationId
        });

    refreshAction.execute(function (err, data) {
        if (err) {
            return callback(err);
        }

        me.access_token = data.access_token;
        me.expired = data.expired;

        callback(null, me);
    });
};

oauthAccessSchema.statics.create = function (data, cb) {
    var oauthAccess = new this(data);

    oauthAccess.save(function (err, oauthAccess) {
        if (err) {
            log.error(err);
            return cb('Server error');
        }

        cb(null, oauthAccess);
    });
};

var OauthAccess = mongoose.model('OauthAccess', oauthAccessSchema);

module.exports = OauthAccess;