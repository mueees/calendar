var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    cheerio = require('cheerio'),
/*readability = require('node-readability'),*/
    unfluff = require('unfluff'),
    sanitizeHtml = require('sanitize-html'),
    rabbitConfig = require('../../config'),
    preparePostQueue = Queue.getQueue('preparePost'),
    savePostQueue = Queue.getQueue('savePost');

function findImg(html) {
    return cheerio.load(html)('img').eq(0).attr('src') || '';
}

function preparePost(post) {
    var def = Q.defer();

    post.description = sanitizeHtml(post.body, {
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

    var data = unfluff(post.body);

    if (data.image) {
        post.title_image = data.image;

        def.resolve(post);
    } else {
        request({
            url: post.link,
            timeout: 6000
        }, function (err, response, body) {
            if (err) {
                log.error(err.message);

                post.title_image = findImg(post.body);
            } else {
                post.title_image = unfluff(body).image;
            }

            def.resolve(post);
        });
    }

    /*readability(post.link, function (err, article, meta) {
     var body = err ? post.body : article.content;

     post.description = sanitizeHtml(body, {
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

     post.title_image = findImg(body);

     // Close article to clean up jsdom and prevent leaks
     if (!err) {
     article.close();
     }

     gc();

     def.resolve(post);
     });*/

    return def.promise;
}

preparePostQueue.process(function (job, done) {
    preparePost(job.data.post).then(function (post) {
        savePostQueue.add({
            post: post
        });

        log.info('Post with guid ' + post.guid + ' was prepared. Description length: ' + post.description.length);

        done();
    }, function (err) {
        log.error(err.message);
        done(err);
    });
});