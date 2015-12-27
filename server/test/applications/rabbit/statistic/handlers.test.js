var assert = require('chai').assert,
    expect = require('chai').expect,

    Q = require('q'),
    _ = require('lodash'),
    testHelpers = require('../../../helpers'),

    FeedStatistic = require('applications/rabbit/common/resources/feedStatistic'),

    rabbitConfig = require('applications/rabbit/config'),
    RabbitRequest = require('common/request/rabbit'),
    StatisticHandler = require('applications/rabbit/services/statistic/common/handlers');

var feeds = [
    {
        url: 'http://feeds.feedburner.com/Techcrunch'
    },
    {
        url: 'http://www.newslookup.com/rss/business/bloomberg.rss'
    }
];

var userId = '559bfe2016bd17920826b366',
    testCategory = {
        name: 'Test category'
    };

describe('Statistic handlers', function () {
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

    beforeEach(function (done) {
        testHelpers.cleanRabbitDb().then(function () {
            done();
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should return Feed Count Map', function (done) {
        var savedFeeds;

        Q.all(_.map(feeds, function (feed) {
            return RabbitRequest.trackFeed(feed, userId)
        })).then(function (feeds) {
            savedFeeds = _.map(feeds, function (response) {
                return response.body;
            });

            return RabbitRequest.createCategory(testCategory, userId);
        }).then(function (response) {
            return RabbitRequest.addFeed(savedFeeds[0]._id, response.body._id, userId);
        }).then(function () {
            StatisticHandler.getFeedCountMap().then(function (feedCountMap) {
                if (_.size(feedCountMap) == 0) {
                    return done(new Error('Something wrong'));
                }

                expect(_.size(feedCountMap)).to.equal(2);

                expect(feedCountMap[savedFeeds[0]._id]).to.equal(1);

                done();
            }, function (err) {
                done(new Error(err));
            });
        }).catch(function (err) {
            done(new Error(err.message));
        });
    });

    it('should update Followed Count', function (done) {
        var savedFeeds;

        Q.all(_.map(feeds, function (feed) {
            return RabbitRequest.trackFeed(feed, userId)
        })).then(function (feeds) {
            savedFeeds = _.map(feeds, function (response) {
                return response.body;
            });

            return RabbitRequest.createCategory(testCategory, userId);
        }).then(function (response) {
            return RabbitRequest.addFeed(savedFeeds[0]._id, response.body._id, userId);
        }).then(function () {
            return StatisticHandler.updateFollowedCount();
        }).then(function () {
            return RabbitRequest.feedsStatistic();
        }).then(function (response) {
            var feedStatistic = _.find(response.body, function (feedStatistic) {
                return feedStatistic.feedId == savedFeeds[0]._id;
            });

            expect(feedStatistic.followedByUser).to.equal(1);

            done();
        }).catch(function (err) {
            done(new Error(err.message));
        });
    });
});