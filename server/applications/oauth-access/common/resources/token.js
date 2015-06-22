var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var tokenSchema = new Schema({
    applicationId: {
        type: String,
        required: true,
    },

    access_token: {
        type: String,
        default: ''
    },
    refresh_token: {
        type: String,
        default: ''
    },

    last_refresh: {
        type: Date
    },

    client_token: {
        type: String,
        default: ''
    },

    userId: {
        type: ObjectId
    }
});

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;