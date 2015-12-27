var FeedManager = require('common/modules/feedManager'),
    _ = require('lodash');

var testFeed = {
    url: 'http://feeds.feedburner.com/Techcrunch'
};

var testPage = {
    url: 'http://edition.cnn.com/2015/12/24/asia/british-us-embassy-warn-of-threats-against-westerners-beijing/index.html'
};

describe('Feed Manager', function () {
    it('should check is Feed Valid', function (done) {
        FeedManager.isValidFeed(testFeed).then(function () {
            done();
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should return feed info', function (done) {
        FeedManager.getFeedInfo(testFeed).then(function (data) {
            done();
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should return page info', function (done) {
        FeedManager.getPageInfo(testPage).then(function (data) {
            done();
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should return posts from feed', function (done) {
        FeedManager.getPostsFromFeed(testFeed).then(function (posts) {
            if(_.isArray(posts)){
                done();
            }else{
                done(new Error('Cannot get posts from feed'));
            }
        }, function (err) {
            done(new Error(err));
        });
    });
});