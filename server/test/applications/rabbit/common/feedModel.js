var Feed = require('applications/rabbit/common/resources/feed'),
    Q = require('q'),
    _ = require('lodash'),
    assert = require('chai').assert,
    expect = require('chai').expect,
    testHelpers = require('../../../helpers'),
    rabbitConfig = require('applications/rabbit/config');

var feed = {
    url: 'http://nicholmagouirk.typepad.com/things_that_really_matter/atom.xml'
};

describe('Feed model', function () {
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

    it('should update feed', function (done) {
        Feed.track(feed.url).then(function (feed) {
            feed.updateInfo().then(function () {
                done();
            }, function (err) {
                done(new Error(err))
            })
        }, function (err) {
            done(new Error(err))
        });
    });
});