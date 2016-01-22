var log = require('common/log')(module),
    _ = require('underscore'),
    lodash = require('lodash'),
    Q = require('q'),
    async = require('async'),
    FeedManager = require('common/modules/feedManager'),
    Feed = require('../../../common/resources/feed'),
    Topic = require('../../../common/resources/topic'),
    Post = require('../../../common/resources/post'),
    Category = require('../../../common/resources/category'),
    UserPostMap = require('../../../common/resources/userPostMap'),
    FeedStatistic = require('../../../common/resources/feedStatistic'),
    HttpError = require('common/errors/HttpError'),
    RabbitRequest = require('common/request/rabbit'),
    validator = require('validator'),
    onlyForUsers = require('common/middlewares/onlyForUsers'),
    prefix = '/api/rabbit';

module.exports = function (app) {
    // api for admin requests
    require('../controllers/admin-controller')(app);

    // create category
    app.put(prefix + '/categories', [onlyForUsers, function (request, response, next) {
        var categoryData = request.body;

        if (!categoryData.name) {
            return next(new HttpError(400, 'Name should exist'));
        }

        categoryData.userId = request.userId;

        Category.create(categoryData, function (err, category) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(500, 'Server error'));
            }

            response.send({
                _id: category._id
            });
        });
    }]);

    // edit category
    app.post(prefix + '/categories/:id', [onlyForUsers, function (request, response, next) {
        var updateData = _.pick(request.body, [
            'name',
            'open',
            'feeds'
        ]);

        Category.update({
            _id: request.params.id
        }, updateData, function (err) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            updateData._id = request.params.id;

            response.send(updateData);
        });
    }]);

    // delete category
    app.delete(prefix + '/categories/:id', [onlyForUsers, function (request, response, next) {
        Category.remove({
            _id: request.params.id,
            userId: request.userId
        }, function (err) {
            if (err) {
                log.error(err.message);
                next(new HttpError(500, 'Server error'));
            }

            response.send({});
        });
    }]);

    // return all user categories
    app.get(prefix + '/categories', [onlyForUsers, function (request, response, next) {
        Category.find({
            userId: request.userId
        }, function (err, categories) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(500, 'Server error'));
            }

            categories = _.map(categories, function (category) {
                return category.toObject();
            });

            var feedIds = _.reduce(categories, function (result, category) {
                result = result.concat(_.map(category.feeds, function (feed) {
                    return String(feed.feedId);
                }));

                return result;
            }, []);

            feedIds = _.uniq(feedIds);

            Feed.find({
                _id: {
                    $in: feedIds
                }
            }, function (err, feeds) {
                if (!err) {
                    feeds = _.map(feeds, function (feed) {
                        feed = feed.toObject();
                        feed._id = String(feed._id);

                        return feed;
                    });

                    _.each(categories, function (category) {
                        _.each(category.feeds, function (feed) {
                            var fullFeed = _.find(feeds, {
                                _id: String(feed.feedId)
                            });

                            if (fullFeed) {
                                feed.domain = fullFeed.domain;
                            }
                        });
                    });
                } else {
                    log.error(err);
                }

                response.send(categories);
            });
        });
    }]);

    // add feed for tracking
    // only for user because of security issues
    app.put(prefix + '/feeds/track', [onlyForUsers, function (request, response, next) {
        if (!request.body.url) {
            return next(new HttpError('Cannot find url'));
        }

        Feed.track(request.body.url).then(function (feed) {
            response.send(feed);
        }, function (err) {
            log.error(err);

            next(new HttpError(400, err));
        });
    }]);

    // delete feed from category
    app.delete(prefix + '/feeds', [onlyForUsers, function (request, response, next) {
        if (!request.body.feedId) {
            return next(new HttpError(400, 'Cannot find feed id'));
        }

        Category.findOne({
            userId: request.userId,
            'feeds.feedId': request.body.feedId
        }, function (err, category) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(400, 'Server error'));
            }

            _.remove(category.feeds, {
                feedId: request.body.feedId
            });

            category.save(function (err) {
                if (err) {
                    log.error(err.message);
                }
            });

            response.send({});
        });
    }]);

    // add feed to category
    app.put(prefix + '/feeds', [onlyForUsers, function (request, response, next) {
        var data = request.body;

        if (!data.feedId) {
            return next(new HttpError(400, 'Cannot find feed id'));
        }

        if (!data.categoryId) {
            return next(new HttpError(400, 'Cannot find category id'));
        }

        async.parallel([
            function (cb) {
                Feed.findOne({
                    _id: data.feedId
                }, function (err, feed) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (feed) {
                        cb(null, feed);
                    } else {
                        cb('Cannot find feed');
                    }
                });
            },
            function (cb) {
                Category.isExist(data.categoryId, request.userId).then(function (category) {
                    cb(null, category);
                }, function (err) {
                    cb(err);
                });
            }
        ], function (err, results) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, err));
            }

            var feed = results[0],
                category = results[1];

            category.feeds.push({
                feedId: feed._id,
                name: data.name ? data.name : feed.title
            });

            category.save(function () {
                if (err) {
                    log.error(err.message);
                    return next(new HttpError(400, 'Cannot save category'));
                }

                response.send({});
            });
        });
    }]);

    // find feeds by query
    function findFeeds(query) {
        var isUrl = validator.isURL(query, {
                require_protocol: true
            }),
            def = Q.defer();

        if (!query) {
            def.reject('Cannot find query');
        } else if (isUrl) {
            /*
             * 1. try to find existing feed
             * 2. suppose this is feed url
             * 3. suppose this is just page
             * */
            Feed.findOne({
                url: query
            }, function (err, feed) {
                if (err) {
                    log.error(err.message);

                    return def.reject('Server error');
                }

                if (feed) {
                    def.resolve([feed]);
                } else {
                    Feed.track(query).then(function (feed) {
                        def.resolve([feed]);
                    }, function () {
                        FeedManager.findFeedUrl({
                            url: query,
                            checkFeedUrl: true
                        }).then(function (feedUrl) {
                            if (feedUrl) {
                                Feed.track(feedUrl).then(function (feed) {
                                    def.resolve([feed]);
                                }, function (err) {
                                    log.error(err);

                                    def.resolve([]);
                                });
                            } else {
                                def.resolve([]);
                            }
                        }, function (err) {
                            log.error(err);

                            def.resolve([]);
                        });
                    });
                }
            });
        } else {
            Feed.findByQuery(query).then(function (feeds) {
                def.resolve(feeds);
            }, function (err) {
                def.reject(err);
            });
        }

        return def.promise;
    }

    app.post(prefix + '/feeds/find', [onlyForUsers, function (request, response, next) {
        async.parallel([
            function (cb) {
                findFeeds(request.body.query).then(function (feeds) {
                    cb(null, feeds);
                }, function (err) {
                    cb(err);
                });
            },
            function (cb) {
                Category.find({
                    userId: request.userId
                }, function (err, categories) {
                    if (err) {
                        return cb(err.message);
                    }

                    var feedIds = _.reduce(categories, function (result, category) {
                        result = result.concat(_.pluck(category.feeds, 'feedId'));
                        return result;
                    }, []);

                    cb(null, feedIds);
                });
            },
            function (cb) {
                FeedStatistic.find({}, cb);
            }
        ], function (err, results) {
            if (err) {
                log.error(err);

                return next(new HttpError(err));
            }

            var feeds = results[0].map(function (feed) {
                    return feed.toObject();
                }),
                userFeedIds = results[1],
                feedStatistics = results[2];

            _.forEach(feeds, function (currentFeed) {
                if (_.find(userFeedIds, function (userFeedId) {
                        return String(userFeedId) == String(currentFeed._id)
                    })) {
                    currentFeed.isFollowed = true;
                }

                currentFeed.statistic = {};

                var feedStatistic = _.find(feedStatistics, function (feedStatistic) {
                    return String(feedStatistic.feedId) == String(currentFeed._id);
                });

                if (feedStatistic) {
                    currentFeed.statistic = _.pick(feedStatistic, 'countPosts', 'countPostPerMonth', 'followedByUser');
                }
            });

            response.send(feeds);
        });
    }]);

    // find most popular feeds
    app.get(prefix + '/feeds/popular', [onlyForUsers, function (request, response, next) {
        var countFeeds = request.query.count || 3;

        async.parallel([
            function (cb) {
                RabbitRequest.feedsStatistic().then(function (data) {
                    var statisticFeeds = data.body;

                    statisticFeeds = _.sortBy(statisticFeeds, 'followedByUser').reverse();

                    cb(null, statisticFeeds);
                }, function (err) {
                    cb(err);
                });
            },
            function (cb) {
                Category.getUserFeedIds(request.userId).then(function (userFeedIds) {
                    cb(null, userFeedIds);
                }, function (err) {
                    cb(err);
                });
            }
        ], function (err, results) {
            if (err) {
                log.error(err);

                return next(new HttpError(500, err))
            }

            var statisticFeeds = results[0],
                userFeedIds = results[1],
                popularFeedIds = [];

            statisticFeeds = lodash.sortByOrder(statisticFeeds, ['followedByUser', 'countPostPerMonth'], ['desc', 'desc']);

            var i = 0;

            while (popularFeedIds.length < countFeeds && i < statisticFeeds.length) {
                // if user doesn't have feedId, push it to popular array
                if (!_.contains(userFeedIds, statisticFeeds[i].feedId)) {
                    popularFeedIds.push(statisticFeeds[i].feedId);
                }

                i++;
            }

            Feed.find({
                _id: {
                    $in: popularFeedIds
                }
            }, function (err, popularFeeds) {
                if (err) {
                    log.error(err);

                    return next(new HttpError(500, 'Server error'));
                }

                popularFeeds = popularFeeds.map(function (feed) {
                    return feed.toObject();
                });

                popularFeeds.forEach(function (feed) {
                    var statisticFeed = _.find(statisticFeeds, {
                        feedId: String(feed._id)
                    });

                    feed.isFollowed = false;
                    feed.statistic = _.pick(statisticFeed, ['countPosts', 'countPostPerMonth']);
                });

                response.send(popularFeeds);
            });
        });
    }]);

    // todo: need test for this api request
    // get feed by id
    app.get(prefix + '/feeds/:id', [onlyForUsers, function (request, response, next) {
        Feed.findOne({
            _id: request.params.id
        }, function (err, feed) {
            if (err) {
                log.error(err.message);

                return next(new Error(err.message));
            }

            if (!feed) {
                return next(new HttpError(400, 'Cannot find feed'));
            }

            feed = feed.toObject();

            delete feed.__v;

            if (request.user) {
                Category.getUserFeedIds(request.userId).then(function (userFeedIds) {
                    if (_.contains(userFeedIds, String(feed._id))) {
                        feed.isFollowed = true;
                    }

                    response.send(feed);
                }, function (err) {
                    log.error(err);

                    return next(new HttpError(500, 'Server error'));
                });
            } else {
                response.send(feed);
            }
        });
    }]);

    /**
     * Find posts by cretirea
     * 1. posts from feedId
     *
     * /posts?feedId=<feedId>
     *
     * 2. posts marked as readLater for userId
     *
     * /posts?readLater=true
     *
     * */
    app.get(prefix + '/posts', [onlyForUsers, function (request, response, next) {
        var postQuery = _.pick(request.query, [
            'feedId'
        ]);

        var postOptionalQuery = _.extend({
            skip: 0,
            limit: 20
        }, _.pick(request.query, [
            'skip',
            'limit'
        ]));

        postOptionalQuery.sort = {
            public_date: -1
        };

        if (postQuery.feedId) {
            // get posts from certain feed
            async.waterfall([
                function (cb) {
                    Post.find(postQuery, null, postOptionalQuery, function (err, posts) {
                        if (err) {
                            log.error(err.message);
                            return cb('Server error');
                        }

                        cb(null, posts);
                    });
                },
                function (posts, cb) {
                    UserPostMap.find({
                        postId: {
                            $in: _.map(posts, function (post) {
                                return post._id;
                            })
                        },
                        userId: request.userId
                    }, function (err, userPostMaps) {
                        if (err) {
                            log.error(err.message);
                            return cb('Server error');
                        }

                        posts = posts.map(function (post) {
                            return post.toObject();
                        });

                        _.each(posts, function (post) {
                            var userInfo = _.find(userPostMaps, function (userPostMap) {
                                return String(userPostMap.postId) == String(post._id)
                            });

                            if (userInfo) {
                                userInfo = userInfo.toObject();

                                userInfo = _.pick(userInfo, [
                                    'isRead',
                                    'readLater',
                                    'tags'
                                ]);
                            } else {
                                userInfo = {};
                            }

                            post.user = userInfo;
                        });

                        cb(null, posts);
                    });
                }
            ], function (err, posts) {
                if (err) {
                    log.error(err.message);
                    return next(new Error(err.message));
                }

                response.send(posts);
            });
        }
    }]);

    // todo: need test for this api request
    app.post(prefix + '/posts/:id/read', [onlyForUsers, function (request, response, next) {
        UserPostMap.findOne({
            userId: request.userId,
            postId: request.params.id
        }, function (err, userPost) {
            if (err) {
                log.error(err.message);
                return next(new Error('Server error'));
            }

            if (!userPost) {
                userPost = new UserPostMap();

                userPost.postId = request.params.id;
                userPost.userId = request.userId;
            }

            userPost.isRead = true;

            userPost.save(function (err) {
                if (err) {
                    log.error(err.message);
                }
            });

            response.send({});
        });
    }]);

    // todo: need test for this api request
    app.post(prefix + '/posts/:id/unread', [onlyForUsers, function (request, response, next) {
        UserPostMap.findOne({
            userId: request.userId,
            postId: request.params.id
        }, function (err, userPost) {
            if (err) {
                log.error(err.message);
                return next(new Error('Server error'));
            }

            if (!userPost) {
                userPost = new UserPostMap();

                userPost.postId = request.params.id;
                userPost.userId = request.userId;
            }

            userPost.isRead = false;

            userPost.save(function (err) {
                if (err) {
                    log.error(err.message);
                }
            });

            response.send({});
        });
    }]);

    // todo: need test for this api request
    app.post(prefix + '/posts/unread', [onlyForUsers, function (request, response, next) {
        UserPostMap.find({
            userId: request.userId,
            postId: {
                $in: request.body.ids
            }
        }, function (err, userPosts) {
            if (err) {
                log.error(err.message);
                return next(new Error('Server error'));
            }

            _.forEach(request.body.ids, function (postId) {
                var userPost = _.find(userPosts, {
                    postId: postId
                });

                if (!userPost) {
                    userPost = new UserPostMap();

                    userPost.postId = postId;
                    userPost.userId = request.userId;

                    userPosts.push(userPost);
                }
            });

            _.forEach(userPosts, function (userPost) {
                userPost.isRead = false;

                userPost.save(function (err) {
                    if (err) {
                        log.error(err);
                    }
                });
            });

            response.send({});
        });
    }]);

    // todo: need test for this api request
    app.post(prefix + '/posts/read', [onlyForUsers, function (request, response, next) {
        UserPostMap.find({
            userId: request.userId,
            postId: {
                $in: request.body.ids
            }
        }, function (err, userPosts) {
            if (err) {
                log.error(err.message);
                return next(new Error('Server error'));
            }

            _.forEach(request.body.ids, function (postId) {
                var userPost = _.find(userPosts, {
                    postId: postId
                });

                if (!userPost) {
                    userPost = new UserPostMap();

                    userPost.postId = postId;
                    userPost.userId = request.userId;

                    userPosts.push(userPost);
                }
            });

            _.forEach(userPosts, function (userPost) {
                userPost.isRead = true;

                userPost.save(function (err) {
                    if (err) {
                        log.error(err);
                    }
                });
            });

            response.send({});
        });
    }]);

    // return all topics
    app.get(prefix + '/topics', function (request, response, next) {
        Topic.find({}, function (err, topics) {
            if (err) {
                log.error(err.message);

                return next(new HttpError(500, 'Server error'));
            }

            topics = lodash.map(topics, function (topic) {
                topic = topic.toObject();

                return lodash.pick(topic, ['_id', 'title', 'title_img', 'related_topics']);
            });

            response.send(topics);
        });
    });
};