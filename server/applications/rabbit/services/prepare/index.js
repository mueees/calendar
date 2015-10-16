var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    rabbitConfig = require('../../config'),
    preparePostQueue = Queue.getQueue('preparePost'),
    savePostQueue = Queue.getQueue('savePost');

function preparePost(post) {
    var def = Q.defer();

    def.resolve(post);

    return def.promise;
}

preparePostQueue.process(function (job, done) {
    preparePost(job.data.post).then(function (post) {


        savePostQueue.add({
            post: post
        });

        log.info('Post with guid' + post.guid + ' was prepared.' );

        done();
    }, function (err) {
        log.error(err.message);
    });
});