var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
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

feedSchema.statics.isValidFeed = function (url) {
    var def = Q.defer();

    request({
        url: url,
        timeout: 2000
    }).on('error', function (error) {
        log.error(error.message);

        def.reject('Wrong url');
    })
        .pipe(new FeedParser())
        .on('error', function (error) {
            log.error(error.message);
            def.reject('This is not feed');
        }).on('readable', function () {
            def.resolve();
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

    Feed.isValidFeed(url).then(function () {
        Feed.create({url: url}, function (err, feed) {
            if (err) {
                log.error(err.message);
                return def.reject('Server error');
            }

            feed.updateInfo().then(function (feed) {
                def.resolve(feed);
            }, function () {
                def.reject('Cannot update feed');
            });
        });
    }, function (err) {
        def.reject(err);
    });

    return def.promise;
};

feedSchema.methods.updateInfo = function () {
    var def = Q.defer(),
        me = this;

    request({
        url: this.url,
        timeout: 2000
    }).on('error', function (error) {
        log.error(error.message);

        def.reject('Wrong url');
    })
        .pipe(new FeedParser())
        .on('error', function (error) {
            log.error(error.message);
            def.reject('This is not feed');
        }).on('readable', function () {
            me.title = this.meta.title ? this.meta.title : me.title;
            me.description = this.meta.description ? this.meta.description : me.description;
            me.author = this.meta.author ? this.meta.author : me.author;
            me.language = this.meta.author ? this.meta.language : me.language;

            me.save(function (err) {
                if (err) {
                    log.error(err.message);
                    return def.reject(err.message);
                }

                def.resolve(me);
            });
        });

    return def.promise;
};

var Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;