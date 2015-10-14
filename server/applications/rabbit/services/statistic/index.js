var Queue = require('../../common/queue'),
    FeedStatistic = require('../../common/resources/feedStatistic'),
    Q = require('q'),
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