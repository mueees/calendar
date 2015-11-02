var FeedStatistic = require('../../common/resources/feedStatistic'),
    Q = require('q'),
    _ = require('underscore'),
    async = require('async'),
    Feed = require('../../common/resources/feed'),
    Post = require('../../common/resources/post'),
    log = require('common/log')(module),
    cronJob = require('cron').CronJob;

// add api module
require('./api');

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

                        countPostPerMonth = count / weeks;
                    }

                    FeedStatistic.update({
                        feedId: feed._id
                    }, {
                        countPosts: count,
                        countPostPerMonth: countPostPerMonth
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

updateCountPosts();

new cronJob('00 00 07,23 * * *', function () {
    updateCountPosts();
}, null, true);