var Q = require('q'),
    _ = require('lodash'),
    expect = require('chai').expect,
    async = require('async'),
    log = require('common/log')(module),
    testHelpers = require('../../../helpers'),
    rabbitConfig = require('applications/rabbit/config');


var deliveryHelpers = require('applications/rabbit/services/delivery/common/helpers');

describe('Helpers in rabbit delivery service', function () {
    before(function (done) {
        // database connection
        require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
            done();
        });
    });

    after(function (done) {
        require("common/mongooseConnect").closeConnection();
        done();
    });

    afterEach(function (done) {
        testHelpers.cleanRabbitDb().then(function () {
            done();
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should return error feed ids', function () {
        var ids = deliveryHelpers._getErrorFeedIds([
            {
                errorCode: 1,
                data: {
                    feedId: 'first'
                }
            },
            {
                errorCode: 1,
                data: {
                    feedId: 'first'
                }
            },
            {
                errorCode: 1,
                data: {
                    feedId: 'second'
                }
            }
        ]);

        expect(ids.length).to.equal(2);
        expect(ids[0]).to.equal('first');
        expect(ids[1]).to.equal('second');
    });

    it('should return feed without errors', function () {
        var feeds = [
                {
                    _id: 'first'
                },
                {
                    _id: 'second'
                },
                {
                    _id: 'third'
                }
            ],
            errorFeeds = [
                {
                    data: {
                        feedId: 'first'
                    }
                }
            ];

        var feeds = deliveryHelpers._getFeedsWithoutErrors(feeds, errorFeeds);

        expect(feeds.length).to.equal(2);
        expect(feeds[0]._id).to.equal('second');
        expect(feeds[1]._id).to.equal('third');
    });

    it('should return feed without statistic', function () {
        var feeds = [
                {
                    _id: 'first'
                },
                {
                    _id: 'second'
                },
                {
                    _id: 'third'
                }
            ],
            statisticFeeds = [
                {
                    feedId: 'first'
                }
            ];

        var feeds = deliveryHelpers._getFeedsWithoutStatistic(feeds, statisticFeeds);

        expect(feeds.length).to.equal(2);
        expect(feeds[0]._id).to.equal('second');
        expect(feeds[1]._id).to.equal('third');
    });

    it('should return statistic feed without error', function () {
        var feedsWithoutError = [
                {
                    _id: 'first'
                }
            ],
            statisticFeeds = [
                {
                    feedId: 'first'
                },
                {
                    feedId: 'second'
                }
            ];

        var statisticFeedsWithoutError = deliveryHelpers._getStatisticFeedsWithoutError(feedsWithoutError, statisticFeeds);

        expect(statisticFeedsWithoutError.length).to.equal(1);
        expect(statisticFeedsWithoutError[0].feedId).to.equal('first');
    });

    it('should return feed without statistic for update', function () {
        var feeds = [
                {
                    _id: 1
                },
                {
                    _id: 2
                }
            ],
            statisticFeeds = [
                {
                    feedId: 2
                }
            ],
            errorFeeds = [
                {
                    data: {
                        feedId: 2
                    }
                }
            ];

        var feedForUpdate = deliveryHelpers._getFeedForUpdate(feeds, statisticFeeds, errorFeeds);

        expect(feedForUpdate).to.be.ok;
        expect(feedForUpdate._id).to.equal(1);
    });

    it('should return feed based on statistic for update', function () {
        var feeds = [
                {
                    _id: '1'
                },
                {
                    _id: '2'
                }
            ],
            statisticFeeds = [
                {
                    feedId: '1',
                    last_update_date: (new Date()).getTime() - 1000 * 60 * 60// 1 hour ago
                },
                {
                    feedId: '2'
                }
            ],
            errorFeeds = [
                {
                    data: {
                        feedId: 2
                    }
                }
            ];

        var feedForUpdate = deliveryHelpers._getFeedForUpdate(feeds, statisticFeeds, errorFeeds);

        expect(feedForUpdate).to.be.ok;
        expect(feedForUpdate._id).to.equal('1');
    });

    it('should not return feed based on statistic for update', function () {
        var feeds = [
                {
                    _id: '1'
                },
                {
                    _id: '2'
                }
            ],
            statisticFeeds = [
                {
                    feedId: '1',
                    last_update_date: (new Date()).getTime() - 1000 * 60 * 20 // 20 minutes ago
                },
                {
                    feedId: '2'
                }
            ],
            errorFeeds = [
                {
                    data: {
                        feedId: 2
                    }
                }
            ];

        var feedForUpdate = deliveryHelpers._getFeedForUpdate(feeds, statisticFeeds, errorFeeds);

        expect(feedForUpdate).not.to.be.ok;
    });
});