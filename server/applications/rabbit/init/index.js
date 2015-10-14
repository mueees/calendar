var rabbitConfig = require('../config'),
    log = require('common/log')(module),
    Feed = require('../common/resources/feed');

var feeds = [
    {
        title: 'Arduino',
        url: 'https://blog.arduino.cc/feed'
    },
    {
        title: 'Cnn',
        url: 'http://rss.cnn.com/rss/cnn_topstories.rss'
    }
];

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
    Feed.remove({}, function () {
        Feed.create(feeds, function (err, feed) {
            if (err) {
                log.error(err.message);
                return;
            }

            log.info('Test feeds were created');

            process.exit();
        });
    });
});