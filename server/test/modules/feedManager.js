var FeedManager = require('common/modules/feedManager'),
    _ = require('lodash'),
    assert = require('chai').assert,
    expect = require('chai').expect;

var testFeed = {
    url: 'http://feeds.feedburner.com/Techcrunch'
};

var testPage = {
    url: 'http://lifehacker.com'
};

describe('Feed Manager', function () {
    it('should check is Feed Valid', function (done) {
        FeedManager.isValidFeed({
            url: 'https://news.ycombinator.com/rss'
        }).then(function () {
            done();
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should return feed info', function (done) {
        FeedManager.getFeedInfo({
            url: 'https://news.ycombinator.com/rss'
        }).then(function (data) {
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

    it('should return domain', function () {
        expect(FeedManager.getDomain('https://rabbit.mue.in.ua/test/one/two')).to.equal('https://rabbit.mue.in.ua');
        expect(FeedManager.getDomain('http://rabbit.mue.in.ua/test/one/two')).to.equal('http://rabbit.mue.in.ua');
        expect(FeedManager.getDomain('http://rabbit.mue.in.ua/@two')).to.equal('http://rabbit.mue.in.ua');
        expect(FeedManager.getDomain('http://in.ua/test/one/two')).to.equal('http://in.ua');
    });

    it('should find feed url by url', function (done) {
        FeedManager.findFeedUrl({
            url: 'http://www.adme.ru/',
            checkFeedUrl: true
        }).then(function (feedLink) {
            console.log(feedLink);
            done();
        }, function (err) {
            done(new Error(err))
        });
    });

    it('should load page', function (done) {
        FeedManager.loadPage({
            url: 'https://news.ycombinator.com/rss'
        }).then(function (data) {
            done();
        }, function (err) {
            done(new Error(err.body.message));
        });
    });

    it('should extract feed info from response object', function (done) {
        FeedManager.loadPage(testFeed).then(function (data) {
            FeedManager.extractFeedInfo(data).then(function () {
                done();
            }, function (err) {
                done(new Error(err));
            });
        });
    });

    it('should return posts from feed', function (done) {
        FeedManager.getPostsFromFeed(testFeed).then(function (posts) {
            done();
        }, function (err) {
            done(new Error(err));
        })
    });

    it('should return error from getPostsFromFeed in right format ', function (done) {
        FeedManager.getPostsFromFeed({
            url: 'http://mue.in.ua'
        }).then(function (posts) {
            done(new Error('Something wrong'));
        }, function (err) {
            expect(err.errorCode).to.equal(3);
            expect(err.errorCode).to.be.ok;
            expect(err.data).to.be.ok;

            done();
        })
    });
});