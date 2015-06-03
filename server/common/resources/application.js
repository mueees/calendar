var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var applicationSchema = new Schema({
    name: {
        type: 'String',
        default: 'New Application'
    },
    publicKey: {
        type: 'String',
        require: true
    },
    privateKey: {
        type: 'String',
        require: true
    }
});

module.exports = applicationSchema;