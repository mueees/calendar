var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var topicSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    related_topic: {
        type: [ObjectId],
        default: []
    }
});

module.exports = mongoose.model('Topic', topicSchema);