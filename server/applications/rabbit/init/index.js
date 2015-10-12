var rabbitConfig = require('../config'),
    log = require('common/log')(module),
    Feed = require('../common/resources/feed');

var feed = {
    title: 'Arduino',
    url: 'https://blog.arduino.cc/feed'
};

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
    Feed.remove({}, function () {
        Feed.create(feed, function (err, feed) {
            if (err) {
                log.error(err.message);
                return;
            }

            log.info('Test feed was created');

            process.exit();
        });
    });
});