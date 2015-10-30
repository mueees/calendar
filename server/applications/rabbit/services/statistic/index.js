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
                Post.getCount({
                    feedId: feed._id
                }).then(function (count) {
                    FeedStatistic.update({
                        feedId: feed._id
                    }, {
                        countPosts: count
                    }, function (err) {
                        if (err) {
                            log.error(err.message);
                        }

                        cb(null);
                    });
                }, function () {
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

new cronJob('* 01,15,30,45,59 * * * *', function () {
    updateCountPosts();
}, null, true);