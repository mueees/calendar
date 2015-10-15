var log = require('common/log')(module),
    _ = require('underscore'),
    async = require('async'),
    Q = require('q'),
    HttpError = require('common/errors/HttpError'),
    FeedStatistic = require('../../../../common/resources/feedStatistic'),
    prefix = '/api/rabbit';

function getFeedStatistic(feedId) {
    var def = Q.defer();

    FeedStatistic.findOne({
        feedId: feedId
    }, function (err, feedStatistic) {
        if (err) {
            log.error(err.message);
            def.reject('Cannot get feedStatistic during mongo error');
            return;
        }

        if (!feedStatistic) {
            FeedStatistic.create({
                feedId: feedId
            }, function (err, feedStatistic) {
                if (err) {
                    log.error(err.message);
                    def.reject('Cannot get feedStatistic during mongo error');
                    return;
                }

                def.resolve(feedStatistic);
            });
        }else {
            def.resolve(feedStatistic);
        }
    });

    return def.promise;
}

module.exports = function (app) {
    app.get(prefix + '/statistic/feeds', function (request, response, next) {
        FeedStatistic.find({}, function (err, feedStatistics) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(400, 'Server error'));
            }

            response.send(feedStatistics);
        });
    });

    app.get(prefix + '/statistic/feeds/:id', function (request, response, next) {
        FeedStatistic.findOne({
            feedId: request.params.id
        }, function (err, feedStatistic) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(400, 'Server error'));
            }

            if (!feedStatistic) {
                return next(new HttpError(400, 'Cannot find statistic about this feed'));
            }

            response.send(feedStatistic);
        });
    });

    app.post(prefix + '/statistic/feeds/:id/lastUpdateTime', function (request, response, next) {
        getFeedStatistic(request.params.id).then(function (feedStatistic) {
            feedStatistic.last_update_date = new Date();

            feedStatistic.save(function (err) {
                if (err) {
                    log.error(err.message);
                    return;
                }

                response.send({});
            });
        }, function (err) {
            next(new HttpError(500, err))
        });
    });
};