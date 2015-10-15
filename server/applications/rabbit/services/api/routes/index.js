var log = require('common/log')(module),
    _ = require('underscore'),
    async = require('async'),
    Feed = require('../../../common/resources/feed'),
    HttpError = require('common/errors/HttpError'),
    validator = require('validator'),
    prefix = '/api/rabbit';

module.exports = function (app) {
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