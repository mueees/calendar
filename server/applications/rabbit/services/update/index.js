var Queue = require('../../common/queue'),
    Feed = require('../../common/resources/feed'),
    Q = require('q'),
    log = require('common/log')(module),
    request = require('request'),
    rabbitConfig = require('../../config'),
    feedForUpdateQueue = Queue.getQueue('feedForUpdate'),
    preparePostQueue = Queue.getQueue('preparePost');

function getNewPosts(posts, lastPost) {
    var result = [];

    if (lastPost) {
        posts.forEach(function (post) {
            var postDate = new Date(post.public_date);

            log.info('Current post public date: ' + postDate);

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
            results[1].public_date = new Date(results[1].public_date);

            log.info('Got ' + results[0].length + ' posts from ' + job.data.feed.url);
            log.info('Last post public date was ' + results[1].public_date);

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
        })
        .catch(function (err) {
            log.error(err);
            done(err);
        });
});