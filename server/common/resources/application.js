var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Q = require('q'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var applicationSchema = new Schema({
    name: {
        type: 'String',
        default: ''
    },
    code: {
        type: 'String',
        require: true
    },
    secret: {
        type: 'String'
    },
    userId: {
        type: ObjectId,
        require: true
    }
});

return mongoose.model('applications', applicationSchema);