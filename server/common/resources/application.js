var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var applicationSchema = new Schema({
    name: {
        type: 'String',
        default: 'New Application'
    },
    public: {
        type: 'String',
        require: true
    },
    private: {
        type: 'String',
        require: true
    }
});

module.exports = applicationSchema;