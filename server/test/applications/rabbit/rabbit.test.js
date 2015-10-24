var RabbitRequest = require('common/request/rabbit'),
    Category = require('applications/rabbit/common/resources/category'),
    Feed = require('applications/rabbit/common/resources/feed'),
    Post = require('applications/rabbit/common/resources/post'),
    UserPostMap = require('applications/rabbit/common/resources/userPostMap'),
    Q = require('q'),
    rabbitConfig = require('applications/rabbit/config');

var userId = '559bfe2016bd17920826b366',
    testCategory = {
        name: 'Test category'
    },
    testFeed = {
        url: 'http://www.pcworld.com/index.rss'
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

            Post.remove({}, function (err) {
                if (err) {
                    return done(new Error(err.message));
                }

                UserPostMap.remove({}, function (err) {
                    if (err) {
                        return done(new Error(err.message));
                    }

                    Feed.remove({}, done);
                });
            });
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

    it('should remove feed from category', function (done) {
        Q.all([
            RabbitRequest.trackFeed(testFeed, userId),
            RabbitRequest.createCategory(testCategory, userId)
        ]).then(function (results) {
            var feedId = results[0].body._id;

            RabbitRequest.addFeed(feedId, results[1].body._id, userId).then(function (res) {
                RabbitRequest.deleteFeed(feedId, userId).then(function () {
                    done();
                }, function (res) {
                    done(new Error(res.body.message));
                });
            });
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

    //

    it.only('should find posts by feedId with user information', function (done) {
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
});