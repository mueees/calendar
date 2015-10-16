var RabbitRequest = require('common/request/rabbit'),
    Category = require('applications/rabbit/common/resources/category'),
    Feed = require('applications/rabbit/common/resources/feed'),
    Q = require('q'),
    rabbitConfig = require('applications/rabbit/config');

var testCategory = {
        name: 'Test category'
    },
    testFeed = {
        url: 'http://www.pcworld.com/index.rss'
    },
    userId = '559bfe2016bd17920826b366';

describe('account-api', function () {
    before(function (done) {
        // database connection
        require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        Category.remove({}, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            Feed.remove({}, done);
        });
    });

    it('should create category', function (done) {
        RabbitRequest.createCategory(testCategory, userId).then(function (res) {
            if (res.body._id) {
                done();
            } else {
                done(new Error('Cannot create new category'));
            }
        }, function (err) {
            done(new Error(err.body.message));
        });
    });

    it('should delete category', function (done) {
        RabbitRequest.createCategory(testCategory, userId).then(function (res) {
            RabbitRequest.deleteCategory(res.body._id, userId).then(function (res) {
                done();
            }, function () {
                done(new Error(res.body.message));
            });
        }, function (err) {
            done(new Error(err.body.message));
        });
    });

    it('should return all categories', function (done) {
        Q.all([
            RabbitRequest.createCategory(testCategory, userId),
            RabbitRequest.createCategory(testCategory, userId)
        ]).then(function () {
            RabbitRequest.getCategories(userId).then(function (res) {
                if (res.body.length == 2) {
                    done()
                } else {
                    done(new Error('Cannot get all categories'));
                }
            }, function (err) {
                done(new Error(err.body.message));
            });
        });
    });

    it('should add feed for tracking', function (done) {
        RabbitRequest.trackFeed(testFeed, userId).then(function (res) {
            if (res.body._id) {
                done();
            } else {
                done(new Error('Cannot add feed for track'));
            }
        }, function (err) {
            done(new Error(err.body.message));
        });
    });

    it('should add feed to category', function (done) {
        Q.all([
            RabbitRequest.trackFeed(testFeed, userId),
            RabbitRequest.createCategory(testCategory, userId)
        ]).then(function (results) {
            RabbitRequest.addFeed(results[0].body._id, results[1].body._id, userId).then(function (res) {
                done();
            }, function (err) {
                done(new Error(err.body.message));
            });
        }, function (err) {
            done(new Error(err.body.message));
        })
    });

    it('should find new feed by url', function (done) {
        RabbitRequest.findFeed(testFeed.url, userId).then(function (res) {
            if (res.body.title) {
                done();
            } else {
                done(new Error('Cannot find feed by url'));
            }
        }, function (err) {
            done(new Error(err.body));
        });
    });

    it('should find feed by title', function (done) {
        RabbitRequest.trackFeed(testFeed, userId).then(function (res) {
            RabbitRequest.findFeed('pcworld', userId).then(function (res) {
                if (res.body.length > 0) {
                    done();
                } else {
                    done(new Error('Cannot find feed by title'));
                }
            }, function (err) {
                done(new Error(err.body.message));
            })
        }, function (err) {
            done(new Error(err.body.message));
        });
    });
});