var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var topicSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    title_img: {
        type: String
    },
    related_topics: {
        type: [ObjectId],
        default: []
    }
});

module.exports = mongoose.model('Topic', topicSchema);