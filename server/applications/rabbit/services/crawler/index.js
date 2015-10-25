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

/*
* 1. последовательно брать уже сохраненные посты
* 2. искать в посте все ссылки
* 3. получать список доменов, проверять возможно такой домен уже проверялся
* 4. сохранять список в mongo
* 5. проходиться по списку доменов, смотреть в html странице на type="application/rss+xml"
* 6. если есть, смотреть возможно такой фид уже есть, если нету, то создававать
* */


// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

/*
 * <link type="application/rss+xml" href="http://www.aweber.com/blog/feed/" />
 * */

// each second
new cronJob('30 * * * * *', function () {

}, null, true);