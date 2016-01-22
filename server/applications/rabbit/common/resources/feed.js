var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    FeedManager = require('common/modules/feedManager'),
    log = require('common/log')(module),
    validator = require('validator'),
    Post = require('./post'),
    async = require('async'),
    _ = require('lodash'),
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
        type: String,
        default: ''
    },
    domain: {
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
                log.error(err);

                return def.reject('Server error');
            }

            feed.updateInfo().then(function (feed) {
                def.resolve(feed);
            }, function () {
                def.resolve(feed);
            });
        });
    }, function (err) {
        log.error(err);

        def.reject(err);
    });

    return def.promise;
};

feedSchema.statics.removeTopic = function (topicId) {
    var def = Q.defer();

    Feed.update({}, {
        $pull: {
            topics: topicId
        }
    }, {
        multi: true
    }, function (err) {
        if (err) {
            log.error(err);

            return def.reject(err);
        }

        def.resolve();
    });

    return def.promise;
};

feedSchema.methods.getPosts = function (limit) {
    var def = Q.defer(),
        limit = limit || 5;

    Post.find({
        feedId: this._id
    }, {}, {
        limit: limit,
        sort: {
            public_date: -1
        }
    }, function (err, posts) {
        if (err) {
            logger.error(err);

            return def.reject(err.message);
        }

        def.resolve(posts);
    });

    return def.promise;
};

feedSchema.methods.getImageFromDomain = function () {
    var def = Q.defer();

    if (this.domain) {
        FeedManager.getPageInfo({
            url: this.domain
        }).then(function (pageInfo) {
            def.resolve(pageInfo.image);
        }, function (err) {
            def.resolve(null);
        });
    } else {
        def.resolve(null);
    }

    return def.promise;
};

feedSchema.methods.getImageFromPosts = function (countPosts) {
    var def = Q.defer(),
        me = this;

    me.getPosts(countPosts).then(function (posts) {
        var postImages = _(posts)
            .map('title_image')
            .compact()
            .value();

        def.resolve(postImages[0]);
    }, function (err) {
        def.resolve(null);
    });

    return def.promise;
};

feedSchema.methods.getImage = function () {
    var def = Q.defer(),
        me = this;

    async.series([
        function (cb) {
            me.getImageFromPosts(10).then(function (imageLink) {
                cb(null, imageLink);
            }, function () {
                cb(null);
            });
        },
        function (cb) {
            me.getImageFromDomain().then(function (imageLink) {
                cb(null, imageLink);
            }, function () {
                cb(null);
            });
        }
    ], function (err, results) {
        if (err) {
            return def.resolve(null);
        }

        def.resolve(results[0] || results[1]);
    });

    return def.promise;
};

feedSchema.methods.updateInfo = function () {
    var def = Q.defer(),
        me = this;

    function getFeedImg(cb) {
        me.getImage().then(function (imageLink) {
            cb(null, imageLink);
        }, function (err) {
            cb(null);
        });
    }

    function getFeedInfo(cb) {
        FeedManager.getFeedInfo({
            url: me.url
        }).then(function (feedInfo) {
            cb(null, feedInfo);
        }, function (err) {
            cb('Cannot load feed');
        });
    }

    async.parallel([
        getFeedInfo,
        getFeedImg
    ], function (err, results) {
        if (err) {
            return def.reject(err);
        }

        var feedImg = results[1],
            feedInfo = results[0];

        if (feedImg || feedInfo) {
            me.title = feedInfo.title ? feedInfo.title : me.title;
            me.description = feedInfo.description ? feedInfo.description : me.description;
            me.author = feedInfo.author ? feedInfo.author : me.author;
            me.language = feedInfo.language ? feedInfo.language : me.language;
            me.domain = feedInfo.domain ? feedInfo.domain : me.domain;
            me.title_img = feedImg ? feedImg : me.title_img;

            me.save(function (err) {
                if (err) {
                    log.error(err.message)
                    log.error('some error')

                    return def.reject(err.message);
                }

                def.resolve(me);
            });
        } else {
            def.resolve(me);
        }
    });

    return def.promise;
};

var Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;