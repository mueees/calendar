var hyperquest = require('hyperquest'),
    hyperquestTimeout = require('hyperquest-timeout'),
    eventStream = require('event-stream'),
    fastFeed = require('fast-feed'),
    unfluff = require('unfluff'),
    sanitizeHtml = require('sanitize-html'),

    util = require('common/helpers').util,
    log = require('common/log')(module),
    Q = require('q'),
    url = require('url'),
    path = require('path'),
    async = require('async'),
    cheerio = require('cheerio'),
    _ = require('lodash');

var rssTypes = ['application/atom+xml', 'application/rss+xml'];

var defaults = {
    timeout: 5000,
    method: 'GET'
};

function getDomain(link) {
    var domain = '';

    if (link) {
        var parsed = url.parse(link);

        domain = (parsed.protocol && parsed.host) ? parsed.protocol + '//' + parsed.host : '';
    }

    return domain;
}

function findFeedUrl(options) {
    var def = Q.defer();

    var domain = util.cutUrlSlash(getDomain(options.url));

    options = _.assign(defaults, options);

    loadPage({
        url: domain,
        timeout: options.timeout
    }).then(function (data) {
        var body = data.body,
            rssLink;

        var link = _.find(cheerio.load(body)('link'), function (link) {
            return _.contains(rssTypes, link.attribs.type);
        });

        if (link) {
            if (_.contains(link.attribs.href, 'http') || _.contains(link.attribs.href, 'https')) {
                rssLink = link.attribs.href;
            } else {
                rssLink = domain + path.normalize('/' + link.attribs.href);
            }
        }

        if (rssLink && options.checkFeedUrl) {
            isValidFeed({
                url: rssLink
            }).then(function (feedInfo) {
                def.resolve(rssLink);
            }, function (err) {
                log.error(err);

                def.resolve(null);
            });
        } else {
            def.resolve(rssLink);
        }
    }, function (err) {
        def.reject(err);
    });

    return def.promise;
}

function getFeedInfo(options) {
    var def = Q.defer();

    loadPage(options)
        .then(function (data) {
            extractFeedInfo(data).then(function (feedInfo) {
                feedInfo.url = options.url;

                def.resolve(feedInfo);
            }, function (err) {
                log.error(err);

                def.reject(err);
            });
        }, function (err) {
            log.error(err);

            def.reject(err);
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

    loadPage(options).then(function (data) {
        data.body = sanitizeHtml(data.body, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
        });

        var pageData = options.lazy ? unfluff.lazy(data.body, 'en') : unfluff(data.body, 'en');

        def.resolve(pageData);
    }, function (err) {
        def.reject(err);
    });

    return def.promise;
}

function getPostsFromFeed(options) {
    var def = Q.defer();

    loadPage(options)
        .then(function (data) {
            extractPostsFromFeed(data).then(function (posts) {
                def.resolve(posts);
            }, function (err) {
                log.error(err);

                def.reject(err);
            });
        }, function (err) {
            log.error(err);

            def.reject(err);
        });

    return def.promise;
}

function isValidFeed(options) {
    return getFeedInfo(options);
}

function loadPage(options) {
    var def = Q.defer();

    options = _.assign(defaults, options);

    var req = hyperquest(options.url, options, function (err, response) {
        if (err) {
            log.error(err);

            return def.reject('Cannot load page');
        }

        if (response.statusCode != 200) {
            return def.reject('Unsuccessfully response from ' + options.url + ' Status: ' + response.statusCode);
        } else {
            response.pipe(eventStream.wait(function (err, body) {
                if (err) {
                    return def.reject('Unexpected error during load page');
                }

                def.resolve({
                    body: body,
                    response: response
                });
            }));
        }
    });

    hyperquestTimeout(req, options.timeout);

    return def.promise;
}

function extractFeedInfo(options) {
    var def = Q.defer();

    options = _.assign(defaults, options);

    fastFeed.parse(options.body, {content: false}, function (err, feed) {
        if (err) {
            log.error(err);

            return def.reject('Cannot parse RSS');
        }

        def.resolve({
            domain: feed.link,
            title: feed.title,
            description: feed.description
        });
    });

    return def.promise;
}

function extractPostsFromFeed(options) {
    var def = Q.defer();

    options = _.assign(defaults, options);

    fastFeed.parse(options.body, function (err, feed) {
        if (err) {
            log.error(err);

            return def.reject('Cannot parse RSS');
        }

        var posts = _.map(feed.items, function (post) {
            return {
                title: post.title || "",
                body: post.summary || post.description || "",
                link: post.link,
                public_date: new Date(post.date) || null,
                guid: post.guid || post.id || ""
            }
        });

        def.resolve(posts);
    });

    return def.promise;
}

function findFirstImageFromUrls(urls) {
    var def = Q.defer();

    var imageLink,
        i = 0;

    async.whilst(
        function () {
            return !imageLink && i < urls.length;
        },
        function (callback) {
            getPageInfo({
                url: urls[i],
                lazy: true,
                timeout: defaults.timeout
            }).then(function (pageInfo) {
                i++;

                var link = pageInfo.image();

                if (link) {
                    imageLink = link;
                }

                callback(null, imageLink);
            }, function () {
                i++;

                callback(null);
            });
        },
        function (err, n) {
            if (err) {
                return def.reject(err);
            }

            def.resolve(imageLink);
        }
    );

    return def.promise;
}

module.exports = {
    extractFeedInfo: extractFeedInfo,
    loadPage: loadPage,
    isValidFeed: isValidFeed,
    getFeedInfo: getFeedInfo,
    getPageInfo: getPageInfo,
    getDomain: getDomain,
    findFeedUrl: findFeedUrl,
    getPostsFromFeed: getPostsFromFeed,
    findFirstImageFromUrls: findFirstImageFromUrls
};