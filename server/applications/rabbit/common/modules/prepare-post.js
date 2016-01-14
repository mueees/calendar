var log = require('common/log')(module),
    Q = require('q'),
    _ = require('lodash'),
    FeedManager = require('common/modules/feedManager');

function prepare(post) {
    var def = Q.defer();

    if (post.link) {
        FeedManager.getPageInfo({
            url: post.link,
            lazy: true
        }).then(function (data) {
            post.title_img = data.image() || '';
            post.description = data.description() || '';

            if (post.text && !post.description) {
                post.description = post.text.slice(0, 100);
            }

            def.resolve(post);
        }, function (err) {
            def.reject(err);
        });
    } else {
        def.resolve(post);
    }

    return def.promise;
}

module.exports = {
    prepare: prepare
};