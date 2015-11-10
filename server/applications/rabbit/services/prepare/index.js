var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    cheerio = require('cheerio'),
    unfluff = require('unfluff'),
    sanitizeHtml = require('sanitize-html'),
    rabbitConfig = require('../../config'),
    preparePostQueue = Queue.getQueue('preparePost'),
    savePostQueue = Queue.getQueue('savePost');

var inQueue = 0,
    maxInQueue = 10;

function findImg(html) {
    return cheerio.load(html)('img').eq(0).attr('src') || '';
}

function getDescription(html) {
    return sanitizeHtml(html, {
        allowedTags: ['p', 'div', 'span', 'b', 'i', 'em', 'strong'],
        transformTags: {
            p: 'span',
            div: 'span',
            b: 'span',
            em: 'span',
            strong: 'span',
            i: 'span'
        }
    });
}

function preparePost(post) {
    var def = Q.defer();

    request({
        url: post.link,
        timeout: 6000
    }, function (err, response, body) {
        if (err) {
            log.error(err.message);

            post.title_image = findImg(post.body);

            post.description = getDescription(post.body);
        } else {
            var data = unfluff(body);

            if (!data.image) {
                log.error('Unfluff cannot find img');
            }

            if (!data.description) {
                log.error('Unfluff cannot find description');
            }

            post.title_image = data.image ? data.image : findImg(post.body);

            post.description = data.description ? data.description : getDescription(post.body);
        }

        def.resolve(post);
    });

    return def.promise;
}

function processJob(job, done) {
    log.info('Jobs in queue: ' + inQueue);

    if (inQueue < maxInQueue) {
        done();

        inQueue++;

        preparePost(job.data.post).then(function (post) {
            savePostQueue.add({
                post: post
            });

            log.info('Description: ' + post.description.length + '. Post ' + post.guid + ' was prepared.');

        }, function (err) {
            log.error(err.message);
        }).fin(function () {
            inQueue--;
        });
    } else {
        setTimeout(function () {
            processJob(job, done);
        }, 1000);
    }
}

preparePostQueue.process(function (job, done) {
    processJob(job, done);
});