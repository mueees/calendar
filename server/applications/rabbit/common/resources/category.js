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

categorySchema.statics.isExist = function (id, userId) {
    var def = Q.defer();

    this.findOne({
        _id: id,
        userId: userId
    }, function (err, category) {
        if (err) {
            log.error(err.message);
            return def.reject('Server error');
        }

        if (category) {
            def.resolve(category);
        } else {
            def.reject('Cannot find category');
        }
    });

    return def.promise;
};

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;