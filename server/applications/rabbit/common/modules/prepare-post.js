var log = log = require('common/log')(module),
    unfluff = require('unfluff'),
    cheerio = require('cheerio'),
    Q = require('q'),
    request = require('request'),
    sanitizeHtml = require('sanitize-html');

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

function prepare(post) {
    var def = Q.defer();

    request({
        url: post.link,
        timeout: 10000
    }, function (err, response, body) {
        /*if (err) {
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
        }*/

        def.resolve(post);
    });

    return def.promise;
}

module.exports = {
    prepare: prepare
};