var Queue = require('../../common/queue'),
    Job = require('../../common/queue/job'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    rabbitConfig = require('../../config'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    cronJob = require('cron').CronJob;

var settings = {
    maxJobInFeedForUpdateQueue: 5,
    maxJobInQueues: 1000
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

    // todo: choose statistic service for choosing feed for update
    Feed.find({}, function (err, feeds) {
        if (err) {
            log.error(err.message);
            def.reject('Cannot get feed');
            return;
        }

        def.resolve(feeds[0]);
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
            var job = new Job({
                feed: feed.toObject()
            });

            log.info('Feed for update was added');

            feedForUpdateQueue.add(job);
        })
        .catch(function (error) {
            log.warning(error);
        });
}, null, true);