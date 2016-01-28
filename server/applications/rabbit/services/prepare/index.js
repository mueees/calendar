var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    _ = require('lodash'),
    RABBIT_ERRORS = require('../../common/error/errors'),
    PreparePost = require('../../common/modules/prepare-post'),
    rabbitErrorHelper = require('../../common/error/helper'),
    rabbitConfig = require('../../config'),
    preparePostQueue = Queue.getQueue('preparePost'),
    savePostQueue = Queue.getQueue('savePost');

var inQueue = 0,
    maxInQueue = 3;

// require('common/modules/heapDump').init(__dirname + '/dump');

function processJob(job, done) {
    if (inQueue < maxInQueue) {

        var post = _.cloneDeep(job.data.post);

        done();
        job.remove();
        job = null;

        inQueue++;

        PreparePost.prepare({
            link: post.link
        }).then(function (preparedPost) {
            _.assign(post, preparedPost);

            savePostQueue.add({
                post: post
            }).then(function(){
                post = null;
            });

            inQueue--;
        }, function (error) {
            savePostQueue.add({
                post: post
            }).then(function(){
                post = null;
            });

            inQueue--;

            var err = {
                data: {
                    post: post
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