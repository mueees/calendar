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
// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

/*
 * <link type="application/rss+xml" href="http://www.aweber.com/blog/feed/" />
 * */


// each second
new cronJob('30 * * * * *', function () {

}, null, true);