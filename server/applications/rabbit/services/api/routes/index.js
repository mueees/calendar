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

    app.get(prefix + '/feeds/search/:query', function (request, response, next) {
        var query = request.params.query,
            isUrl = validator.isURL(query, {
                require_protocol: true
            });

        if (isUrl) {
            Feed.isValidFeed(query).then(function () {
                Feed.create({
                    url: query
                }, function (err, feed) {
                    if (err) {
                        log.error(err.message);
                        response.send([]);
                        return;
                    }

                    response.send(feed);
                });
            }, function () {
                response.send([]);
            });
        } else {

        }
    });
};