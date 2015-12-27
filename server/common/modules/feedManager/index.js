var request = require('request'),
    log = require('common/log')(module),
    Q = require('q'),
    unfluff = require('unfluff'),
    FeedParser = require('feedparser'),
    _ = require('lodash');

var defaults = {
    timeout: 30000
};

function getFeedInfo(options) {
    var def = Q.defer();

    options = _.assign(defaults, options);

    request({
        url: options.url,
        timeout: options.timeout
    }).on('error', function (error) {
        log.error(error.message);

        def.reject('Wrong url');
    })
        .pipe(new FeedParser())
        .on('error', function (error) {
            log.error(error.message);

            def.reject('Cannot load feed info');
        })
        .on('readable', function () {
            var matches = this.read().meta.link.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);

            var feedInfo = {
                url: options.url,
                title: this.meta.title,
                description: this.meta.description,
                author: this.meta.author,
                language: this.meta.language,
                favicon: this.meta.favicon,
                domain: matches[1] + matches[2] + '.' + matches[3]
            };

            if (feedInfo.domain) {
                getPageInfo({
                    url: feedInfo.domain,
                    lazy: true
                }).then(function (pageInfo) {
                    if (pageInfo.image) {
                        feedInfo.title_img = pageInfo.image();
                    }

                    def.resolve(feedInfo);
                }, function () {
                    def.resolve(feedInfo);
                });
            } else {
                def.resolve(feedInfo);
            }
        });

    return def.promise;
}

/**
 * Response example
 {
    "title": "Shovel Knight review: rewrite history",
    "text": "Shovel Knight is inspired by the past in all the right ways — but it's far from stuck in it. [.. snip ..]",
    "image": "http://cdn2.vox-cdn.com/uploads/chorus_image/image/34834129/jellyfish_hero.0_cinema_1280.0.png",
    "tags": [],
    "videos": [],
    "canonicalLink": "http://www.polygon.com/2014/6/26/5842180/shovel-knight-review-pc-3ds-wii-u",
    "lang": "en",
    "description": "Shovel Knight is inspired by the past in all the right ways — but it's far from stuck in it.",
    "favicon": "http://cdn1.vox-cdn.com/community_logos/42931/favicon.ico"
}*/
function getPageInfo(options) {
    var def = Q.defer();

    var getPageOptions = {
        lazy: false
    };

    options = _.assign(defaults, getPageOptions, options);

    request({
        url: options.url,
        timeout: options.timeout
    }, function (err, response, body) {
        if (err) {
            log.error(err.message);

            def.reject('Connection problem');
        }

        var pageInfo = options.lazy ? unfluff.lazy(body) : unfluff(body);

        def.resolve(pageInfo);
    });

    return def.promise;
}

function getPostsFromFeed(options) {
    var def = Q.defer(),
        posts = [];

    options = _.assign(defaults, options);

    request({
        url: options.url,
        timeout: options.timeout
    }).on('error', function (error) {
        log.error(error.message);

        def.reject(error.message);
    })
        .pipe(new FeedParser())
        .on('error', function (error) {
            log.error(error.message);

            def.reject(error.message);
        })
        .on('readable', function () {
            var post,
                stream = this;

            while (post = stream.read()) {
                posts.push({
                    title: post.title || "",
                    body: post.summary || "",
                    link: post.link || "",
                    public_date: new Date(post.pubdate) || null,
                    guid: post.guid || "",
                    title_image: post.image || ""
                });
            }
        })
        .on('end', function () {
            def.resolve(posts);
        });

    return def.promise;
}

function isValidFeed(options) {
    return getFeedInfo(options);
}

module.exports = {
    isValidFeed: isValidFeed,
    getFeedInfo: getFeedInfo,
    getPageInfo: getPageInfo,

    getPostsFromFeed: getPostsFromFeed
};