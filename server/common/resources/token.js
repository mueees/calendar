var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

var tokenSchema = new Schema({
    token: {
        type: "String",
        required: true
    },
    date_create: {
        type: 'Date',
        default: new Date()
    },
    date_expired: {
        type: 'Date',
        required: true
    }
});

module.exports = tokenSchema;