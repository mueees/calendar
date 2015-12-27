var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    FeedManager = require('common/modules/feedManager'),
    log = require('common/log')(module),
    request = require('request'),
    validator = require('validator'),
    FeedParser = require('feedparser'),
    Post = require('./post'),
    Q = require('q');

var feedSchema = new Schema({
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    language: {
        type: String,
        default: 'en'
    },
    author: {
        type: String,
        default: ''
    },

    // url to img
    title_img: {
        type: String
    },
    domain: {
        type: String
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
        timeout: options.timeout || 10000
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
                    title_image: post.image || "",
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
            logger.error(err);
            return def.reject(err.message);
        }

        def.resolve(lastPost);
    });

    return def.promise;
};

feedSchema.statics.getFirstPost = function (feedId) {
    var def = Q.defer();

    Post.findOne({
        feedId: feedId
    }, {}, {
        sort: {
            public_date: 1
        }
    }, function (err, firstPost) {
        if (err) {
            logger.error(err);
            return def.reject(err.message);
        }

        def.resolve(firstPost);
    });

    return def.promise;
};

feedSchema.statics.findByQuery = function (query) {
    var def = Q.defer();

    this.find({
        $or: [
            {
                title: {
                    $regex: query,
                    $options: 'i'
                }
            },
            {
                url: {
                    $regex: query,
                    $options: 'i'
                }
            }
        ]
    }, function (err, feeds) {
        if (err) {
            logger.error(err.message);
            return def.reject('Server error');
        }

        def.resolve(feeds);
    });

    return def.promise;
};

feedSchema.statics.track = function (url) {
    var def = Q.defer(),
        isUrl = validator.isURL(url, {
            require_protocol: true
        });

    if (!isUrl) {
        return def.reject('Its not url');
    }

    FeedManager.isValidFeed({
        url: url
    }).then(function (feedInfo) {
        Feed.create(feedInfo, function (err, feed) {
            if (err) {
                log.error(err.message);

                return def.reject('Server error');
            }

            def.resolve(feed);
        });
    }, function (err) {
        def.reject(err);
    });

    return def.promise;
};

feedSchema.methods.updateInfo = function () {
    var def = Q.defer(),
        me = this;

    FeedManager.getFeedInfo({
        url: this.url
    }).then(function (feedInfo) {
        me.title = feedInfo.title ? feedInfo.title : me.title;
        me.description = feedInfo.description ? feedInfo.description : me.description;
        me.author = feedInfo.author ? feedInfo.author : me.author;
        me.language = feedInfo.language ? feedInfo.language : me.language;
        me.title_img = feedInfo.title_img ? feedInfo.title_img : me.title_img;
        me.domain = feedInfo.domain ? feedInfo.domain : me.domain;

        me.save(function (err) {
            if (err) {
                log.error(err.message);

                return def.reject(err.message);
            }

            def.resolve(me);
        });
    }, function (err) {
        def.reject(err);
    });

    return def.promise;
};

var Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;