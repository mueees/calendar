var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    cheerio = require('cheerio'),
    rabbitConfig = require('../../config'),
    preparePostQueue = Queue.getQueue('preparePost'),
    savePostQueue = Queue.getQueue('savePost');

function findImg(html) {
    return cheerio.load(html)('img').eq(0).attr('src') || '';
}

function preparePost(post) {
    var def = Q.defer();

    post.title_image = findImg(post.body);

    def.resolve(post);

    return def.promise;
}

preparePostQueue.process(function (job, done) {
    preparePost(job.data.post).then(function (post) {
        savePostQueue.add({
            post: post
        });

        log.info('Post with guid' + post.guid + ' was prepared.');

        done();
    }, function (err) {
        log.error(err.message);
    });
});