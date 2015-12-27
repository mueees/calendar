var FeedStatistic = require('../../../../common/resources/feedStatistic'),
    Category = require('../../../../common/resources/category'),
    Q = require('q'),
    _ = require('underscore'),
    async = require('async'),
    Feed = require('../../../../common/resources/feed'),
    Post = require('../../../../common/resources/post'),
    log = require('common/log')(module);

function getFeedCountMap() {
    var def = Q.defer();

    async.parallel([
        function (cb) {
            Category.find({}, cb);
        },
        function (cb) {
            Feed.find({}, cb);
        }
    ], function (err, results) {
        if (err) {
            def.reject(err.message);

            return log.error(err.message);
        }

        var categories = results[0],
            feeds = results[1];

        var feedCountMap = {};

        feeds.forEach(function (feed) {
            feedCountMap[feed._id] = 0;
        });

        categories.forEach(function (category) {
            category.feeds.forEach(function (feed) {
                feedCountMap[feed.feedId] += 1;
            })
        });

        def.resolve(feedCountMap);
    });

    return def.promise;
}

function updateCountPosts() {
    // update count post
    log.info('Update Count Posts');

    var start = new Date();

    Feed.find({}, function (err, feeds) {
        if (err) {
            log.error(err.message);
            return;
        }

        var series = [];

        _.each(feeds, function (feed) {
            series.push(function (cb) {
                Q.all([
                    Feed.getFirstPost(feed._id),
                    Post.getCount({
                        feedId: feed._id
                    })
                ]).then(function (results) {
                    var firstPost = results[0],
                        count = results[1],
                        countPostPerMonth = -1;

                    if (firstPost) {
                        var weeks = ((new Date()).getTime() - firstPost.public_date) / (1000 * 60 * 60 * 24 * 7);
                        weeks = parseInt(weeks) || 1;

                        countPostPerMonth = Math.round(count / weeks);
                    }

                    FeedStatistic.update({
                        feedId: feed._id
                    }, {
                        countPosts: count,
                        countPostPerMonth: countPostPerMonth
                    }, {
                        upsert: true
                    }, function (err) {
                        if (err) {
                            log.error(err.message);
                        }

                        log.info('Feed ' + feed._id + ' was updated.');

                        cb(null);
                    });
                }, function (err) {
                    log.info('Statistic feed ' + feed._id + ' was not updated.');
                    log.error(err);
                    cb(null);
                });
            });
        });

        async.series(series, function (err, results) {
            if (err) {
                log.error(err);
            }

            log.info('Update count posts takes: ' + ((new Date()).getTime() - start) / 1000 + ' seconds');
        });
    });
}

function updateFollowedCount() {
    log.info('Update Count Users that followed feed');

    var def = Q.defer(),
        start = new Date();

    getFeedCountMap().then(function (feedCountMap) {
        var series = [];

        _.each(feedCountMap, function (followedCount, feedId) {
            series.push(function (cb) {
                FeedStatistic.update({
                    feedId: feedId
                }, {
                    followedByUser: followedCount
                }, {
                    upsert: true
                }, function (err) {
                    if (err) {
                        log.error(err.message);

                        cb(err);
                    }

                    cb(null);
                });
            });
        });

        async.series(series, function (err, resul) {
            if (err) {
                log.error(err);

                def.reject(err);
            }

            def.resolve();

            log.info('Update Count Users that followed feed takes: ' + ((new Date()).getTime() - start) / 1000 + ' seconds');
        });
    });

    return def.promise;
}

module.exports = {
    getFeedCountMap: getFeedCountMap,
    updateCountPosts: updateCountPosts,
    updateFollowedCount: updateFollowedCount
};