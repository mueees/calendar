var Queue = require('../../common/queue'),
    FeedStatistic = require('../../common/resources/feedStatistic'),
    Q = require('q'),
    _ = require('underscore'),
    async = require('async'),
    Feed = require('../../common/resources/feed'),
    Post = require('../../common/resources/post'),
    log = require('common/log')(module),
    cronJob = require('cron').CronJob,
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    savePostQueue = Queue.getQueue('savePost'),
    preparePostQueue = Queue.getQueue('preparePost');

// add api module
require('./api');

function countJobInQueues() {
    feedForUpdateQueue.count().then(function (count) {
        console.log(count + ' feedForUpdateQueue');
    });

    preparePostQueue.count().then(function (count) {
        console.log(count + ' preparePostQueue');
    });

    savePostQueue.count().then(function (count) {
        console.log(count + ' savePostQueue');
    });

    console.log('-----------------');
}

// each second
new cronJob('* * * * * *', function () {
    // countJobInQueues();
}, null, true);

function updateCountPosts() {
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
        });
    });
}

new cronJob('* 01,15,30,45,59 * * * *', function () {
    updateCountPosts();
}, null, true);