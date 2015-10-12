var Queue = require('../../common/queue'),
    Job = require('../../common/queue/job'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    preparePostQueue = Queue.getQueue('preparePost');

function getNewPosts(posts, lastPost) {
    var result = posts;

    if (lastPost) {
        posts.forEach(function (post) {
            if (new Date(post.pubdate) > new Date(lastPost.public_date)) {
                result.push(post);
            }
        });
    }

    return result;
}

feedForUpdateQueue.process(function (job, done) {
    Q.all([
        Feed.getPostsFromUrl({
            url: job.data.feed.url,
            feedId: job.data.feed._id,
            timeout: 4000
        })/*,
        Feed.getLastPost(job.data.feed._id)*/
    ])
        .then(function (results) {
            var newPosts = getNewPosts(results[0], results[1]);

            newPosts.forEach(function (post) {
                preparePostQueue.add({
                    post: post
                });
            });

            log.info(newPosts.length + ' were added for prepare');

            done();
        })
        .catch(function (err) {
            log.error(err);
            done(err);
        });
});