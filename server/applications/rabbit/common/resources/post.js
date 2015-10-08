var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    },
    calendarId: {
        type: 'String',
        required: true
    }
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;