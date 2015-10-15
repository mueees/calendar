var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    _ = require('underscore'),
    log = require('common/log')(module),
    async = require('async'),
    rabbitConfig = require('../../config'),
    cronJob = require('cron').CronJob;

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

function updateFeedInfo() {
    Feed.find({}, function (err, feeds) {
        if (err) {
            return log.error(err.message);
        }

        var series = [];

        _.each(feeds, function (feed) {
            series.push(function (cb) {
                feed.updateInfo().then(function () {
                    log.info(feed.title + ' was updated');

                    cb();
                }, function (err) {
                    log.error(err);
                    cb();
                });
            });
        });

        async.series(series, function (err, results) {
            if (err) {
                log.error(err);
            }
        });
    })
}

updateFeedInfo();

new cronJob('* 00 12 * * *', function () {
    updateFeedInfo();
}, null, true);