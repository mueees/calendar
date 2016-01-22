var adminPrefix = '/api/admin/rabbit',
    onlyForAdmin = require('common/middlewares/onlyForAdmin'),

    log = require('common/log')(module),
    _ = require('underscore'),
    lodash = require('lodash'),
    Q = require('q'),
    async = require('async'),

    Feed = require('../../../common/resources/feed'),
    Topic = require('../../../common/resources/topic'),
    Post = require('../../../common/resources/post'),
    Category = require('../../../common/resources/category'),
    UserPostMap = require('../../../common/resources/userPostMap'),
    FeedStatistic = require('../../../common/resources/feedStatistic'),
    HttpError = require('common/errors/HttpError');

module.exports = function (app) {

    // edit feed
    app.post(adminPrefix + '/feeds/:id', [onlyForAdmin, function (request, response, next) {
        var updateData = _.pick(request.body, [
            'title',
            'description',
            'language',
            'author',
            'title_img',
            'domain',
            'topics',
            'url'
        ]);

        Feed.update({
            _id: request.params.id
        }, updateData, function (err) {
            if (err) {
                log.error(err);

                return next(new HttpError(400, 'Server error'));
            }

            updateData._id = request.params.id;

            response.send(updateData);
        });
    }]);

    // delete feed and all related stuff with this feed
    app.delete(adminPrefix + '/feeds/:id', [onlyForAdmin, function (request, response, next) {
        async.parallel([
            function (cb) {
                Feed.remove({
                    _id: request.params.id
                }, cb);
            },
            function (cb) {
                FeedStatistic.remove({
                    feedId: request.params.id
                }, cb);
            },
            function (cb) {
                Post.remove({
                    feedId: request.params.id
                }, cb);
            }
        ], function (err) {
            if (err) {
                log.error(err);

                return next(new HttpError(500, 'Server error'));
            }

            response.send({});
        });
    }]);

    // TOPIC

    // delete topic
    app.delete(adminPrefix + '/topics/:id', [onlyForAdmin, function (request, response, next) {
        async.parallel([
            function (cb) {
                Topic.remove({
                    _id: request.params.id
                }, cb);
            },
            function (cb) {
                Feed.removeTopic(request.params.id).then(function () {
                    cb();
                }, function (err) {
                    cb(err);
                });
            }, function (cb) {
                Topic.removeFromRelatedTopics(request.params.id).then(function () {
                    cb();
                }, function (err) {
                    cb(err);
                });
            }
        ], function (err) {
            if (err) {
                log.error(err);

                return next(new HttpError(500, 'Server error'));
            }

            response.send({});
        });
    }]);

    // create topic
    app.put(adminPrefix + '/topics', [onlyForAdmin, function (request, response, next) {
        var topicData = request.body;

        if (!topicData.title) {
            return next(new HttpError(400, 'Title should exist'));
        }

        Topic.create(topicData, function (err, topic) {
            if (err) {
                log.error(err.message);

                return next(new HttpError(500, 'Server error'));
            }

            response.send({
                _id: topic._id
            });
        });
    }]);

    // edit topic
    app.post(adminPrefix + '/topics/:id', [onlyForAdmin, function (request, response, next) {
        var updateData = _.pick(request.body, [
            'title',
            'title_img',
            'related_topics'
        ]);

        Topic.update({
            _id: request.params.id
        }, updateData, function (err) {
            if (err) {
                log.error(err);

                return next(new HttpError(400, 'Server error'));
            }

            updateData._id = request.params.id;

            response.send(updateData);
        });
    }]);

    // COMMAND

    // check existing feed ( can retrive info )

    // get posts from existing feed

    // +
};