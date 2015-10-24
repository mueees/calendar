var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    Q = require('q');

var userPostSchema = new Schema({
    userId: {
        type: ObjectId,
        required: true
    },
    postId: {
        type: ObjectId,
        required: true
    },
    feedId: {
        type: ObjectId,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readLater: {
        type: Boolean,
        default: false
    },
    tags: {
        type: Array,
        default: []
    }
});

var UserPostMap = mongoose.model('UserPostMap', userPostSchema);

module.exports = UserPostMap;