var assert = require('chai').assert,
    expect = require('chai').expect,

    rabbitConfig = require('applications/rabbit/config'),
    updateHandler = require('applications/rabbit/services/update/handler'),
    testHelpers = require('../../../helpers');

var testFeed = {
    url: 'http://feeds.feedburner.com/Techcrunch'
};

var error1Feed = {
    url: 'http://fake.fake'
};

var error2Feed = {
    url: 'http://feeds.feedburner.com'
};


describe('Update handler', function () {
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

    it('should return new posts', function (done) {
        updateHandler({
            data: {
                feed: testFeed
            }
        }).then(function (posts) {
            done();
        }, function (err) {
            done(new Error(err.message));
        });
    });

    it('should return 2 error code for fake feed', function (done) {
        updateHandler({
            data: {
                feed: error2Feed
            }
        }).then(function () {
            done();
        }, function (err) {
            expect(err.errorCode).to.equal(2);
            done();
        });
    });

    it('should return 1 error code for fake feed', function (done) {
        updateHandler({
            data: {
                feed: error1Feed
            }
        }).then(function () {
            done();
        }, function (err) {
            expect(err.errorCode).to.equal(1);
            done();
        });
    });
});