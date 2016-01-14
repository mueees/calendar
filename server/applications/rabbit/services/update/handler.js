var Feed = require('../../common/resources/feed'),
    Q = require('q'),
    FeedManager = require('common/modules/feedManager'),
    log = require('common/log')(module),
    _ = require('lodash');

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

module.exports = function (job) {
    return Q.all([
        FeedManager.getPostsFromFeed({
            url: job.data.feed.url
        }),
        Feed.getLastPost(job.data.feed._id)
    ])
        .then(function (results) {
            var latestPosts = results[0],
                lastPost = results[1];

            log.info(latestPosts.length + ' posts on feed.');

            _.each(latestPosts, function (post) {
                post.feedId = job.data.feed._id;
            });

            latestPosts = _.filter(latestPosts, 'link');

            if (lastPost) {
                lastPost.public_date = new Date(lastPost.public_date);
            }

            return getNewPosts(latestPosts, lastPost);
        });
};