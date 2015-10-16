var log = require('common/log')(module),
    _ = require('underscore'),
    async = require('async'),
    Feed = require('../../../common/resources/feed'),
    Category = require('../../../common/resources/category'),
    HttpError = require('common/errors/HttpError'),
    validator = require('validator'),
    prefix = '/api/rabbit';

module.exports = function (app) {

    /* CATEGORY */

    // create category
    app.put(prefix + '/categories', function (request, response, next) {
        var categoryData = request.body;

        if (!categoryData.name) {
            return next(new HttpError(400, 'Name should exist'));
        }

        categoryData.userId = request.userId;

        Category.create(categoryData, function (err, category) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(500, 'Server error'));
            }

            response.send({
                _id: category._id
            });
        });
    });

    // delete category
    app.delete(prefix + '/categories/:id', function (request, response, next) {
        Category.remove({
            _id: request.params.id,
            userId: request.userId
        }, function (err) {
            if (err) {
                log.error(err.message);
                next(new HttpError(500, 'Server error'));
            }

            response.send({});
        });
    });

    // return all user categories
    app.get(prefix + '/categories', function (request, response, next) {
        Category.find({
            userId: request.userId
        }, function (err, categories) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(500, 'Server error'));
            }

            response.send(categories);
        });
    });

    /* FEED*/

    // add feed to category
    app.put(prefix + '/feeds', function (request, response, next) {
        var data = request.body;

        if (!data.feedId) {
            return next(new HttpError(400, 'Cannot find feed id'));
        }

        if (!data.categoryId) {
            return next(new HttpError(400, 'Cannot find category id'));
        }

        async.parallel([
            function (cb) {
                Feed.findOne({
                    _id: data.feedId
                }, function (err, feed) {
                    if (err) {
                        return cb('Server error');
                    }

                    if (feed) {
                        cb(null, feed);
                    } else {
                        cb('Cannot find feed');
                    }
                });
            },
            function (cb) {
                Category.isExist(data.categoryId, request.userId).then(function (category) {
                    cb(null, category);
                }, function (err) {
                    cb(err);
                });
            }
        ], function (err, results) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, err));
            }

            var feed = results[0],
                category = results[1];

            category.feeds.push({
                feedId: feed._id,
                name: data.name ? data.name : feed.title
            });

            category.save(function () {
                if (err) {
                    log.error(err.message);
                    return next(new HttpError(400, 'Cannot save category'));
                }

                response.send({});
            });
        });
    });

    // add feed for tracking
    app.put(prefix + '/feeds/track', function (request, response, next) {
        if (!request.body.url) {
            return next(new HttpError('Cannot find url'));
        }

        Feed.track(request.body.url).then(function (feed) {
            response.send(feed);
        }, function (err) {
            log.error(err);
            next(new HttpError(400, err));
        });
    });

    app.post(prefix + '/feeds/find', function (request, response, next) {
        var query = request.body.query,
            isUrl = validator.isURL(query, {
                require_protocol: true
            });

        if (!query) {
            return next(new HttpError(400, 'Cannot find query'));
        }

        if (isUrl) {
            Feed.isValidFeed(query).then(function () {
                Feed.create({
                    url: query
                }, function (err, feed) {
                    if (err) {
                        log.error(err.message);
                        return next(new HttpError(400, 'Server error'));
                    }

                    feed.updateInfo().then(function (feed) {
                        response.send(feed);
                    }, function () {
                        next(new HttpError(400, 'Cannot update feed'));
                    });
                });
            }, function () {
                response.send([]);
            });
        } else {
            Feed.findByQuery(query).then(function (feeds) {
                response.send(feeds);
            }, function (err) {
                next(new HttpError(400, err));
            });
        }
    });
};