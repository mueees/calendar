var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    _ = require('lodash'),
    rabbitConfig = require('../../config'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    preparePostQueue = Queue.getQueue('preparePost');

function getNewPosts(posts, lastPost) {
    var result = [];

    if (lastPost) {
        posts.forEach(function (post) {
            var postDate = new Date(post.public_date);

            if (postDate > lastPost.public_date) {
                result.push(post);
            }
        });
    } else {
        result = posts;
    }

    return result;
}

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

feedForUpdateQueue.process(function (job, done) {
    Q.all([
        Feed.getPostsFromUrl({
            url: job.data.feed.url,
            feedId: job.data.feed._id
        }),
        Feed.getLastPost(job.data.feed._id)
    ])
        .then(function (results) {
            var latestPosts = results[0],
                lastPost = results[1];

            latestPosts = _.filter(latestPosts, 'link');

            if (lastPost) {
                lastPost.public_date = new Date(lastPost.public_date);
            }

            log.info('Got ' + latestPosts.length + ' posts from ' + job.data.feed.url);

            var newPosts = getNewPosts(latestPosts, lastPost);

            newPosts.forEach(function (post) {
                preparePostQueue.add({
                    post: post
                });
            });

            if (newPosts.length) {
                log.info(newPosts.length + ' posts were added for prepare');
            } else {
                log.info('Any new posts');
            }

            done();
        }, function (err) {
            log.error(err);
            done(err);
        })
        .catch(function (err) {
            log.error(err);
            done(err);
        });
});