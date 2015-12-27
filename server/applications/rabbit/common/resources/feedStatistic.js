var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    request = require('request'),
    Post = require('./post'),
    Q = require('q');

var feedStatisticSchema = new Schema({
    feedId: {
        type: ObjectId,
        required: true
    },
    last_update_date: {
        type: Date
    },
    countPosts: {
        type: Number,
        default: 0
    },
    countPostPerMonth: {
        type: Number,
        default: 0
    },

    // how many users follow this feed
    followedByUser: {
        type: Number,
        default: 0
    }
});

var FeedStatistic = mongoose.model('FeedStatistic', feedStatisticSchema);

module.exports = FeedStatistic;