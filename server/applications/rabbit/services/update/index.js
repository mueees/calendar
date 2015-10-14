var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    rabbitConfig = require('../../config'),
    RabbitRequest = require('common/request/rabbit'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    preparePostQueue = Queue.getQueue('preparePost');

function getNewPosts(posts, lastPost) {
    var result = [];

    if (lastPost) {
        posts.forEach(function (post) {
            if (new Date(post.public_date) > new Date(lastPost.public_date)) {
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
            feedId: job.data.feed._id,
            timeout: 4000
        }),
        Feed.getLastPost(job.data.feed._id)
    ])
        .then(function (results) {
            var newPosts = getNewPosts(results[0], results[1]);

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

            RabbitRequest.setLastUpdateDate(job.data.feed._id);
        })
        .catch(function (err) {
            log.error(err);
            done(err);
        });
});