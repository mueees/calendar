var hyperquest = require('common/modules/hyperdirect').request,
    hyperquestTimeout = require('hyperquest-timeout'),
    eventStream = require('event-stream'),
    fastFeed = require('fast-feed'),
    unfluff = require('unfluff'),
    sanitizeHtml = require('sanitize-html'),
    ERRORS = require('./errors'),
    zlib = require('zlib'),

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
        url: options.url,
        timeout: options.timeout
    }).then(function (data) {
        var body = data.body,
            rssLink;

        var link = _.find(cheerio.load(body)('link'), function (link) {
            return _.contains(rssTypes, link.attribs.type);
        });

        var parsedUrl = url.parse(domain);

        if (link) {
            if (_.contains(link.attribs.href, 'http') || _.contains(link.attribs.href, 'https')) {
                rssLink = link.attribs.href;
            } else {
                var relativeRssLink;

                if (_.contains(link.attribs.href, parsedUrl.host)) {
                    var domainPosition = link.attribs.href.indexOf(parsedUrl.host);

                    relativeRssLink = link.attribs.href.slice(domainPosition + parsedUrl.host.length);
                } else {
                    relativeRssLink = link.attribs.href;
                }

                rssLink = domain + path.normalize('/' + relativeRssLink);
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
            if (data.response.statusCode != 200) {
                return def.reject({
                    module: 'feedModule',
                    errorCode: 2,
                    data: data
                });
            }

            extractFeedInfo(data).then(function (feedInfo) {
                feedInfo.url = options.url;

                def.resolve(feedInfo);
            }, function (err) {
                log.error(err);

                def.reject(err);
            });
        }, function (err) {
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
        if (data.response.statusCode != 200) {
            return def.reject({
                module: 'feedModule',
                errorCode: 2,
                data: data
            });
        }

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
            if (data.response.statusCode != 200) {
                return def.reject({
                    module: 'feedModule',
                    errorCode: 2,
                    data: data
                });
            }

            extractPostsFromFeed(data).then(function (posts) {
                def.resolve(posts);
            }, function (err) {
                def.reject(err);
            });
        }, function (err) {
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

            return def.reject({
                module: 'feedModule',
                errorCode: 1,
                data: {
                    error: err
                }
            });
        }

        var stream = response;

        if (response.headers['content-encoding']) {
            var gzip = zlib.createGunzip();

            response.pipe(gzip);

            stream = gzip;
        }

        stream.pipe(eventStream.wait(function (err, body) {
            if (err) {
                log.error(err);

                return def.reject({
                    module: 'feedModule',
                    errorCode: 1,
                    data: {
                        error: err
                    }
                });
            }

            def.resolve({
                body: body,
                response: response
            });
        }));
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

            return def.reject({
                module: 'feedModule',
                errorCode: 4,
                data: {
                    error: err
                }
            });
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

            return def.reject({
                module: 'feedModule',
                errorCode: 3,
                data: {
                    error: err
                }
            });
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

module.exports = {
    extractFeedInfo: extractFeedInfo,
    loadPage: loadPage,
    isValidFeed: isValidFeed,
    getFeedInfo: getFeedInfo,
    getPageInfo: getPageInfo,
    getDomain: getDomain,
    findFeedUrl: findFeedUrl,
    getPostsFromFeed: getPostsFromFeed,
    ERRORS: ERRORS
};