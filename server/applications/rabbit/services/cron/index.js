var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    _ = require('underscore'),
    log = require('common/log')(module),
    Feed = require('../../common/resources/feed'),
    rabbitConfig = require('../../config'),
    cronJob = require('cron').CronJob;

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

// update name, description, icon
function _updateFeed(feed, cb) {

}

function updateFeedInfo() {
    Feed.find({}, function (err, feeds) {
        if (err) {
            return log.error(err.message);
        }

        var series = [];

        _.each(feeds, function (feed) {
            series.push(function (cb) {
                updateFeedInfo(feed).then(function () {
                    cb();
                }, function (err) {
                    cb(err);
                });
            });
        });

        async.series(series, function (err, results) {
            if(err){
                log.error(err);
            }
        });
    })
}

new cronJob('* * * * * *', function () {
    // updateFeedInfo();
}, null, true);