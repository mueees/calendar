var RabbitRequest = require('common/request/rabbit'),
    Category = require('applications/rabbit/common/resources/category'),
    Feed = require('applications/rabbit/common/resources/feed'),
    Post = require('applications/rabbit/common/resources/post'),
    UserPostMap = require('applications/rabbit/common/resources/userPostMap'),
    Q = require('q'),
    _ = require('lodash'),
    assert = require('chai').assert,
    expect = require('chai').expect,
    async = require('async'),
    log = require('common/log')(module),
    testHelpers = require('../../../helpers'),
    rabbitConfig = require('applications/rabbit/config');


describe('rabbit-error service', function () {
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

    it('should not log error without errorCode', function (done) {
        RabbitRequest.sendErrorReport({}).then(function () {
            done(new Error('Something wrong'));
        }, function (err) {
            done();
        });
    });

    it('should not log error with errorCode but without required data', function (done) {
        RabbitRequest.sendErrorReport({
            errorCode: 1
        }).then(function () {
            done(new Error('Something wrong'));
        }, function (err) {
            done();
        });
    });

    it('should log error with errorCode and data', function (done) {
        RabbitRequest.sendErrorReport({
            errorCode: 1,
            data: {
                feedId: 'testFeedId'
            }
        }).then(function (err) {
            done();
        }, function (err) {
            done(new Error('Something wrong'));
        });
    });

    it('should return all feed errors', function (done) {
        Q.all([
            RabbitRequest.sendErrorReport({
                errorCode: 1,
                data: {
                    feedId: 'testFeedId'
                }
            }),
            RabbitRequest.sendErrorReport({
                errorCode: 1,
                data: {
                    feedId: 'testFeedId'
                }
            })
        ]).then(function () {
            RabbitRequest.getAllFeedErrors().then(function (data) {
                expect(data.body.length).to.equal(2);
                done()
            }, function (err) {
                done(new Error(err.body));
            })
        });
    });
});