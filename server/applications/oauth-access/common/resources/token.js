var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    heplers = require('common/helpers');

var tokenSchema = new Schema({
    applicationId: {
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

tokenSchema.statics.create = function (data, cb) {
    data.client_token = heplers.util.getUUID();

    var token = new this(data);

    token.save(function (err, token) {
        if (err) {
            log.error(err);
            return cb('Server error');
        }

        cb(null, token);
    });
};

tokenSchema.statics.getTokenByClientToken = function(client_token, cb){
    this.findOne({
        client_token: client_token
    }, null, function(err, token){
        if( err ){
            return cb("Server error");
        }

        if(!token){
            cb(null, false);
        } else {
            cb(null, token);
        }
    });
};

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;