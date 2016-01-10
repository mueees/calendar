var statisticHandlers = require('./common/handlers'),
    cronJob = require('cron').CronJob;

// add api module
require('./api');

new cronJob('00 00 07,23 * * *', function () {
    statisticHandlers.updateCountPosts();
}, null, true);

new cronJob('00 00 06,22 * * *', function () {
    statisticHandlers.updateFollowedCount();
}, null, true);

