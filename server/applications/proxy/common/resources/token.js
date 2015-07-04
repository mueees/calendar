var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    RefreshAccessToken = require('../actions/RefreshAccessToken'),
    beforeRefreshTime = 1000 * 30, // 30 seconds
    helpers = require('common/helpers');

var tokenSchema = new Schema({
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
    client_token: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

tokenSchema.methods.isNeedRefresh = function () {
    return (new Date()).getTime() - this.last_refresh > this.exchange - beforeRefreshTime;
};

tokenSchema.methods.refreshAccessToken = function (callback) {
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

tokenSchema.statics.create = function (data, cb) {
    data.client_token = helpers.util.getUUID();

    var token = new this(data);

    token.save(function (err, token) {
        if (err) {
            log.error(err);
            return cb('Server error');
        }

        cb(null, token);
    });
};

tokenSchema.statics.getTokenByClientToken = function (client_token, cb) {
    this.findOne({
        client_token: client_token
    }, null, function (err, token) {
        if (err) {
            return cb("Server error");
        }

        if (!token) {
            cb(null, false);
        } else {
            cb(null, token);
        }
    });
};

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;