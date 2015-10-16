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
    maxJobInFeedForUpdateQueue: 0,
    maxJobInQueues: 50,
    timeBeforeUpdateSameFeed: 60 * 10 // seconds
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

        if (!feeds.length) {
            return def.reject('Cannot find any feeds');
        }

        RabbitRequest.feedsStatistic().then(function (data) {
            var statisticFeeds = data.body,
                feedWithoutStatistic;

            // if we don't have any statistic, choose first feed
            if (!statisticFeeds.length) {
                def.resolve(feeds[0]);
                RabbitRequest.setLastUpdateDate(String(feeds[0]._id));
                return;
            }

            _.each(statisticFeeds, function (statisticFeed) {
                statisticFeed.last_update_date = new Date(statisticFeed.last_update_date);
            });

            statisticFeeds.sort(function (a, b) {
                return new Date(a.last_update_date) - new Date(b.last_update_date);
            });

            _.each(feeds, function (feed) {
                feed = feed.toObject();

                var statisticFeed = _.filter(statisticFeeds, {
                    feedId: String(feed._id)
                });

                if (!statisticFeed.length) {
                    feedWithoutStatistic = feed;
                    return false;
                }
            });


            var feedForUpdate;

            // if we have feed that doesn't have statistic, choose them
            if (feedWithoutStatistic) {
                feedForUpdate = feedWithoutStatistic;
                // choose last updated feed
            } else if ((new Date() - statisticFeeds[0].last_update_date) / 1000 > settings.timeBeforeUpdateSameFeed) {
                feedForUpdate = _.filter(feeds, function (feed) {
                    return feed.id == statisticFeeds[0].feedId;
                })[0];
            }

            if (feedForUpdate) {
                def.resolve(feedForUpdate);
                RabbitRequest.setLastUpdateDate(String(feedForUpdate._id));
            } else {
                def.reject('No feed for update');
            }
        }, function () {
            def.resolve(feeds[0]);
        });
    });

    return def.promise;
}

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

// each second
new cronJob('30 * * * * *', function () {
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