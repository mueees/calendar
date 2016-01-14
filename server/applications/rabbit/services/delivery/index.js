var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    _ = require('underscore'),
    log = require('common/log')(module),
    rabbitConfig = require('../../config'),
    deliveryHelpers = require('./common/helpers'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate');

var settings = {
    maxJobInFeedForUpdateQueue: 0,
    maxJobInQueues: 50,
    deliveryFeedTimeout: 5000
};

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

function canAddFeedToUpdate() {
    var def = Q.defer();

    feedForUpdateQueue.count().then(function (jobCount) {
        if (jobCount > settings.maxJobInFeedForUpdateQueue) {
            def.reject(jobCount + " jobs in feedForUpdateQueue queue. Reject.");
        } else {

            // find, how much uncomplited job in rabbit queue in general
            Queue.countJobs(["feedForUpdate", "preparePost"]).then(function (count) {
                if (count > settings.maxJobInQueues) {
                    def.reject(count + " jobs in feedForUpdate and preparePost queues. Reject.");
                } else {
                    def.resolve();
                }
            });
        }
    }, function (err) {
        log.error(err);
        def.reject();
    });

    return def.promise;
}

function deliveryFeed() {
    canAddFeedToUpdate()
        .then(deliveryHelpers.getFeedForUpdate)
        .then(function (feed) {
            feedForUpdateQueue.add({
                feed: feed
            });

            log.info(feed.url + ' was sent to update');

            setTimeout(function () {
                deliveryFeed();
            }, settings.deliveryFeedTimeout);
        }, function (err) {
            log.info(err);

            setTimeout(function () {
                deliveryFeed();
            }, settings.deliveryFeedTimeout);
        })
        .catch(function (error) {
            log.warning(error);

            setTimeout(function () {
                deliveryFeed();
            }, settings.deliveryFeedTimeout);
        });
}

deliveryFeed();