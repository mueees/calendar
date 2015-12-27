var RabbitRequest = require('common/request/rabbit'),
    Category = require('applications/rabbit/common/resources/category'),
    Feed = require('applications/rabbit/common/resources/feed'),
    Post = require('applications/rabbit/common/resources/post'),
    UserPostMap = require('applications/rabbit/common/resources/userPostMap'),
    Q = require('q'),
    _ = require('lodash'),
    assert = require('chai').assert,
    expect = require('chai').expect,
    testHelpers = require('../../../helpers'),
    rabbitConfig = require('applications/rabbit/config');

var userId = '559bfe2016bd17920826b366',
    testCategory = {
        name: 'Test category'
    },
    testFeed = {
        url: 'http://feeds.feedburner.com/Techcrunch'
    },
    testPost = {
        _id: '559bfe2016bd17920826b366',
        title: 'test title',
        body: 'test body',
        link: 'test link',
        guid: 'test guid',
        feedId: '559bfe2016bd17920826b366'
    },
    testUserPostMap = {
        postId: testPost._id,
        feedId: '559bfe2016bd17920826b366',
        userId: userId
    };

var feeds = [
    {
        url: 'http://feeds.feedburner.com/Techcrunch'
    },
    {
        url: 'http://www.vice.com/rss'
    }
];

function createPost() {
    var def = Q.defer();

    Post.create(testPost, function (err, post) {
        if (err) {
            return def.reject(err);
        }

        def.resolve(post);
    });

    return def.promise;
}

function createUserPostMap() {
    var def = Q.defer();

    UserPostMap.create(testUserPostMap, function (err, userPostMap) {
        if (err) {
            return def.reject(err);
        }

        def.resolve(userPostMap);
    });

    return def.promise;
}

describe('rabbit-api', function () {
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
        });
    });

    it('should find new feed by url', function (done) {
        RabbitRequest.findFeed(testFeed.url, userId).then(function (res) {
            if (res.body[0].title) {
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
            RabbitRequest.findFeed('Techcrunch', userId).then(function (res) {
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

    it('should find posts by feedId', function (done) {
        createPost().then(function () {
            var query = 'feedId=' + testPost.feedId;

            RabbitRequest.findPosts(query, userId).then(function (res) {
                if (res.body.length == 1) {
                    done();
                } else {
                    done(new Error('Cannot find posts'));
                }
            }, function (res) {
                done(new Error(res.body.message));
            });
        }, function (err) {
            done(new Error(err.message));
        });
    });

    it('should find posts by feedId with user information', function (done) {
        Q.all([
            createPost(),
            createUserPostMap()
        ]).then(function () {
            var query = 'feedId=' + testPost.feedId;

            RabbitRequest.findPosts(query, userId).then(function (res) {
                if (res.body.length == 1 && res.body[0].user && res.body[0].user.tags) {
                    done();
                } else {
                    done(new Error('Cannot find posts'));
                }
            }, function (res) {
                done(new Error(res.body.message));
            });
        });
    });

    it('should return popular feeds', function (done) {
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
            return RabbitRequest.updateFollowedCount(userId);
        }).then(function () {
            return RabbitRequest.getPopularFeeds(userId, 2);
        }).then(function (response) {
            expect(response.body.length).to.equal(1);

            done();
        }).catch(function (err) {
            done(new Error(err.message));
        });
    });
});