var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    public_date: {
        type: Date,
        default: new Date()
    },
    create_date: {
        type: Date,
        default: new Date()
    },
    guid: {
        type: String,
        required: true
    },
    feedId: {
        type: ObjectId,
        required: true
    },
    title_image: {
        type: String
    }
});

module.exports = mongoose.model('Post', postSchema);