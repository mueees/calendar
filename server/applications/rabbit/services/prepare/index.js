var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    PreparePost = require('../../common/modules/prepare-post'),
    rabbitConfig = require('../../config'),
    preparePostQueue = Queue.getQueue('preparePost'),
    savePostQueue = Queue.getQueue('savePost');

var inQueue = 0,
    maxInQueue = 3;

function processJob(job, done) {
    log.info('Jobs in queue: ' + inQueue);

    if (inQueue < maxInQueue) {
        done();

        inQueue++;

        PreparePost.prepare(job.data.post).then(function (post) {
            inQueue--;

            savePostQueue.add({
                post: post
            });

            log.info('Description: ' + post.description.length + '. Post ' + post.guid + ' was prepared.');

        }, function (err) {
            inQueue--;

            log.error(err.message);
        });
    } else {
        log.info('So many jobs: ' + inQueue);

        setTimeout(function () {
            processJob(job, done);
        }, 1000);
    }
}

preparePostQueue.process(processJob);