var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    _ = require('underscore'),
    log = require('common/log')(module),
    rabbitConfig = require('../../config'),
    RabbitRequest = require('common/request/rabbit'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    cronJob = require('cron').CronJob;

var settings = {
    maxJobInFeedForUpdateQueue: 10000,
    maxJobInQueues: 1000,
    timeBeforeUpdateSameFeed: 120 // seconds
};

function canAddFeedToUpdate() {
    var def = Q.defer();

    feedForUpdateQueue.count().then(function (jobCount) {
        if (jobCount > settings.maxJobInFeedForUpdateQueue) {
            def.reject("So many jobs in feedForUpdateQueue queue: " + jobCount);
        } else {
            // find, how much uncomplited job in rabbit queue in general
            Queue.countJobs(["feedForUpdate", "preparePost"]).then(function (count) {
                if (count > settings.maxJobInQueue) {
                    def.reject('So many jobs in feedForUpdate and preparePost queues.');
                } else {
                    def.resolve();
                }
            });
            def.resolve();
        }
    }, function (err) {
        log.error(err);
        def.reject();
    });

    return def.promise;
}

// Choose feed based on Statistic service
function getFeedForUpdate() {
    var def = Q.defer();

    Feed.find({}, function (err, feeds) {
        if (err) {
            log.error(err.message);
            def.reject('Cannot get feed');
            return;
        }

        RabbitRequest.feedsStatistic().then(function (data) {
            var statisticFeeds = data.body,
                feedWithoutStatistic;

            if (!statisticFeeds.length) {
                def.resolve(feeds[0]);
                return;
            }

            _.each(statisticFeeds, function (statisticFeed) {
                statisticFeed.last_update_date = new Date(statisticFeed.last_update_date);
            });

            statisticFeeds.sort(function (a, b) {
                return new Date(b.last_update_date) - new Date(a.last_update_date);
            });

            _.each(feeds, function (feed) {
                feed = feed.toObject();

                var statisticFeed = _.filter(statisticFeeds, {
                    feedId: feed._id
                });

                if (!statisticFeed.length) {
                    feedWithoutStatistic = feed;
                    return false;
                }
            });

            if (feedWithoutStatistic) {
                def.resolve(feedWithoutStatistic);
            } else if ((new Date() > statisticFeeds[0].last_update_date) / 1000 > settings.timeBeforeUpdateSameFeed) {
                def.resolve(statisticFeeds[0]);
            } else {
                def.reject('No feed for update');
            }
        });
    });


    return def.promise;
}

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

// each second
new cronJob('* * * * * *', function () {
    canAddFeedToUpdate()
        .then(getFeedForUpdate)
        .then(function (feed) {
            log.info('Feed for update was added');

            feedForUpdateQueue.add({
                feed: feed
            });
        })
        .catch(function (error) {
            log.warning(error);
        });
}, null, true);