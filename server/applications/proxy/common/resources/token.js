var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    helpers = require('common/helpers');

var tokenSchema = new Schema({
    oauthAccessId: {
        type: ObjectId,
        required: true
    },
    client_token: {
        type: String,
        required: true
    }
});

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

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;