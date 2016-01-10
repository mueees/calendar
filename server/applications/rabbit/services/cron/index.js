var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Post = require('../../common/resources/post'),
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

        var series = [],
            i = 0,
            countFailedFeeds = 0,
            successFeeds = [];

        _.each(feeds, function (feed) {
            series.push(function (cb) {
                log.info('Start ' + i + ' feed with url ' + feed.url);
                log.info(countFailedFeeds + ' was failed');

                feed.updateInfo().then(function () {
                    log.info('Updated ' + feed.url);
                    i++;
                    successFeeds.push(feed.url);

                    cb();
                }, function (err) {
                    log.error(err);
                    i++;
                    countFailedFeeds++;

                    cb();
                });
            });
        });

        console.log('Start update ' + series.length + ' feeds');

        var start = new Date();

        // parallelLimit
        async.series(series,  function (err, results) {
            log.info('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');


            log.info('Success feeds');
            log.info(successFeeds);

            log.info(countFailedFeeds + ' was failed');
            log.info(successFeeds + ' was success');

            if (err) {
                log.error(err);
            }

            log.info('All feeds were updated. It takes ' + ((new Date()).getTime() - start)/1000 + ' seconds.');
        });
    });
}

new cronJob('00 00 12 * * *', function () {
    updateFeedInfo();
}, null, true);