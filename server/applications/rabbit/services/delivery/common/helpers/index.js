var RabbitRequest = require('common/request/rabbit'),
    Feed = require('../../../../common/resources/feed'),
    _ = require('lodash'),
    async = require('async'),
    Q = require('q'),
    log = require('common/log')(module);

var settings = {
    timeBeforeUpdateSameFeed: 60 * 30 // seconds*minutes
};


function _getErrorFeedIds(errorFeeds) {
    return _(errorFeeds)
        .map(function (error) {
            return error.data.feedId
        })
        .compact()
        .uniq()
        .value();
}

function _getFeedsWithoutErrors(feeds, errorFeeds) {
    var errorFeedIds = _getErrorFeedIds(errorFeeds);

    return _.filter(feeds, function (feed) {
        return !_.contains(errorFeedIds, String(feed._id));
    });
}

function _getFeedsWithoutStatistic(feeds, statisticFeeds) {
    var statisticFeedIds = _.map(statisticFeeds, 'feedId');

    return _.filter(feeds, function (feed) {
        return !_.contains(statisticFeedIds, String(feed._id));
    });
}

function _getStatisticFeedsWithoutError(feedsWithoutError, statisticFeeds) {
    var feedIdsWithoutError = _.map(feedsWithoutError, function (feed) {
        return String(feed._id);
    });

    return _.filter(statisticFeeds, function (statisticFeed) {
        return _.contains(feedIdsWithoutError, statisticFeed.feedId);
    });
}

function _getFeedForUpdate(feeds, statisticFeeds, errorFeeds) {
    var feedForUpdate;

    var feedsWithoutError = _getFeedsWithoutErrors(feeds, errorFeeds);

    log.info((feeds.length - feedsWithoutError.length) + ' feeds have error');

    if (feedsWithoutError.length) {
        var feedsWithoutStatistic = _getFeedsWithoutStatistic(feedsWithoutError, statisticFeeds);

        if (feedsWithoutStatistic.length) {
            // choose first feed that doesn't have error and statistic
            feedForUpdate = feedsWithoutStatistic[0];
        } else {
            // choose last updated feed that doesn't has error
            var statisticFeedsWithoutError = _getStatisticFeedsWithoutError(feedsWithoutError, statisticFeeds);

            statisticFeedsWithoutError.sort(function (a, b) {
                return new Date(a.last_update_date) - new Date(b.last_update_date);
            });

            if (statisticFeedsWithoutError[0]) {
                if (statisticFeedsWithoutError[0].last_update_date) {
                    statisticFeedsWithoutError[0].last_update_date = new Date(statisticFeedsWithoutError[0].last_update_date);

                    var countTimeSinceLastUpdate = ((new Date()) - statisticFeedsWithoutError[0].last_update_date) / 1000;

                    if (countTimeSinceLastUpdate > settings.timeBeforeUpdateSameFeed) {
                        feedForUpdate = _.find(feedsWithoutError, function (feed) {
                            return feed._id == statisticFeedsWithoutError[0].feedId;
                        });
                    }
                }
            }
        }
    }

    return feedForUpdate;
}

// Choose feed based on Statistic service and Error service
function getFeedForUpdate() {
    var def = Q.defer();

    async.parallel([
        function (cb) {
            Feed.find(cb);
        }, function (cb) {
            RabbitRequest.feedsStatistic().then(function (statisticFeeds) {
                cb(null, statisticFeeds);
            }, function () {
                cb('Cannot get feed statistics');
            });
        }, function (cb) {
            RabbitRequest.getAllFeedErrors().then(function (feedErrors) {
                cb(null, feedErrors);
            }, function () {
                cb('Cannot get feed errors');
            });
        }
    ], function (err, results) {
        if (err) {
            log.error(err);

            return def.reject(err);
        }

        var feeds = results[0],
            statisticFeeds = results[1].body,
            errorFeeds = results[2].body;

        var feedForUpdate = _getFeedForUpdate(feeds, statisticFeeds, errorFeeds);

        if (feedForUpdate) {
            RabbitRequest.setLastUpdateDate(String(feedForUpdate._id));

            def.resolve(feedForUpdate);
        } else {
            def.reject('Cannot find any feed for update');
        }
    });

    return def.promise;
}

module.exports = {
    getFeedForUpdate: getFeedForUpdate,
    _getStatisticFeedsWithoutError: _getStatisticFeedsWithoutError,
    _getFeedsWithoutStatistic: _getFeedsWithoutStatistic,
    _getFeedsWithoutErrors: _getFeedsWithoutErrors,
    _getErrorFeedIds: _getErrorFeedIds,
    _getFeedForUpdate: _getFeedForUpdate
};