var Queue = require('../../common/queue'),
    handler = require('./handler'),
    log = require('common/log')(module),
    rabbitErrorHelper = require('../../common/error/helper'),
    RABBIT_ERRORS = require('../../common/error/errors'),
    rabbitConfig = require('../../config'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    preparePostQueue = Queue.getQueue('preparePost');

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

feedForUpdateQueue.process(function (job, done) {
    handler(job).then(function (posts) {
        posts.forEach(function (post) {
            preparePostQueue.add({
                post: post
            });
        });

        log.info(posts.length + ' new posts.');
        log.info('Feed was updated: ' + job.data.feed.url);

        done();
    }, function (error) {
        done();

        var err = {
            errorCode: RABBIT_ERRORS.unknown_error.code,
            data: {
                feedId: job.data.feed._id
            }
        };

        if (error.module == 'feedModule') {
            switch (error.errorCode) {
                case 1:
                    err.errorCode = RABBIT_ERRORS.feed_unexpected_load_page.code;
                    break;
                case 2:
                    err.errorCode = RABBIT_ERRORS.feed_bad_status_load_page.code;
                    break;
            }
        }

        rabbitErrorHelper.sendError(err);
    }).catch(function (e) {
        log.error(e.message);

        done();
    });
});