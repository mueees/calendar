var FeedStatistic = require('../../common/resources/feedStatistic'),
    Category = require('../../common/resources/category'),
    Q = require('q'),
    _ = require('underscore'),
    async = require('async'),
    Feed = require('../../common/resources/feed'),
    Post = require('../../common/resources/post'),
    log = require('common/log')(module),
    cronJob = require('cron').CronJob;

// add api module
require('./api');



new cronJob('00 00 07,23 * * *', function () {
    updateCountPosts();
}, null, true);

new cronJob('00 00 06,22 * * *', function () {
    updateFollowedCount();
}, null, true);

