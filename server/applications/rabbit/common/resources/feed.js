var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    request = require('request'),
    FeedParser = require('feedparser'),
    Post = require('./post'),
    Q = require('q');

var feedSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },

    // base64
    ico: {
        type: String,
        default: ''
    },
    create_date: {
        type: Date,
        default: new Date()
    },
    topics: {
        type: [ObjectId],
        default: []
    }
});

feedSchema.statics.getPostsFromUrl = function (options) {
    var posts = [],
        def = Q.defer();

    request({
        url: options.url,
        timeout: options.timeout || 5000
    }).on('error', function (error) {
        log.error(error.message);
        def.reject(error.message);
    })
        .pipe(new FeedParser())
        .on('error', function (error) {
            log.error(error.message);
            def.reject(error.message);
        })
        .on('readable', function () {
            var post,
                stream = this;
            while (post = stream.read()) {
                posts.push({
                    title: post.title || "",
                    body: post.summary || "",
                    link: post.link || "",
                    public_date: new Date(post.pubdate) || null,
                    guid: post.guid || "",
                    image: post.image || "",
                    feedId: options.feedId
                });
            }
        })
        .on('end', function () {
            def.resolve(posts);
        });

    return def.promise;
};

feedSchema.statics.getLastPost = function (feedId) {
    var def = Q.defer();

    Post.findOne({
        feedId: feedId
    }, {}, {
        sort: {
            public_date: -1
        }
    }, function (err, lastPost) {
        if (err) {
            logger.error(err.message);
            return def.reject(err.message);
        }

        def.resolve(lastPost);
    });

    return def.promise;
};

var Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;