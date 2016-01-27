var log = require('common/log')(module),
    _ = require('underscore'),
    async = require('async'),
    Q = require('q'),
    HttpError = require('common/errors/HttpError'),
    internalRequests = require('common/middlewares/internal-requests'),
    StatisticHandlers = require('../../common/handlers'),
    FeedStatistic = require('../../../../common/resources/feedStatistic'),
    prefix = '/api/rabbit';

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
        response.send({});

        FeedStatistic.update({
            feedId: request.params.id
        }, {
            last_update_date: new Date()
        }, {
            upsert: true
        }, function(err){
            if (err) {
                log.error(err.message);
            }
        });
    });

    app.get(prefix + '/statistic/updateFollowedCount', [internalRequests, function (request, response, next) {
        StatisticHandlers.updateFollowedCount().then(function () {
           response.send({});
        }, function (err) {
            next(new HttpError(400, err.message));
        });
    }]);
};