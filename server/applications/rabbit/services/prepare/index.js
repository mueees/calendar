var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    RABBIT_ERRORS = require('../../common/error/errors'),
    PreparePost = require('../../common/modules/prepare-post'),
    rabbitErrorHelper = require('../../common/error/helper'),
    rabbitConfig = require('../../config'),
    preparePostQueue = Queue.getQueue('preparePost'),
    savePostQueue = Queue.getQueue('savePost');

var inQueue = 0,
    maxInQueue = 3;

function processJob(job, done) {
    if (inQueue < maxInQueue) {
        done();

        inQueue++;

        PreparePost.prepare(job.data.post).then(function (post) {
            inQueue--;

            savePostQueue.add({
                post: post
            });
        }, function (error) {
            inQueue--;

            savePostQueue.add({
                post: job.data.post
            });

            var err = {
                data: {
                    post: job.data.post
                }
            };

            if (error.module == 'feedModule') {
                switch (error.errorCode) {
                    case 1:
                        err.errorCode = RABBIT_ERRORS.post_prepare_unexpected_load_page.code;
                        break;
                    case 2:
                        err.errorCode = RABBIT_ERRORS.post_prepare_bad_status_load_page.code;
                        break;
                }

                log.error(error.data.error.message);
            }

            rabbitErrorHelper.sendError(err);
        });
    } else {
        log.info('So many jobs: ' + inQueue);

        setTimeout(function () {
            processJob(job, done);
        }, 1000);
    }
}

preparePostQueue.process(processJob);