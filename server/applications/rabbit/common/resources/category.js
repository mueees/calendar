var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    request = require('request'),
    FeedParser = require('feedparser'),
    Post = require('./post'),
    Q = require('q');

var feedSchema = new Schema({
    feedId: {
        type: ObjectId,
        required: true
    },

    /*
     * Name feed for current user
     * */
    name: {
        type: String
    },
    date_added: {
        type: Date,
        default: new Date()
    }
});

var categorySchema = new Schema({
    name: {
        type: String,
        require: true
    },
    userId: {
        type: ObjectId,
        require: true
    },
    create_data: {
        type: Date,
        default: new Date()
    },
    feeds: {
        type: [feedSchema],
        default: []
    }
});

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;