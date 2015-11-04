var unfluff = require('unfluff'),
    request = require('request'),
    sanitizeHtml = require('sanitize-html'),
    Feed = require('../../applications/rabbit/common/resources/feed'),
    linkFeed = 'http://feeds.gawker.com/lifehacker/vip',
    linkPost = 'http://edition.cnn.com/2015/11/03/africa/russian-plane-crash-egypt-sinai/index.html';

Feed.getPostsFromUrl({
    url: linkFeed,
    feedId: 'test'
}).then(function (posts) {
    var firstPost = posts[0];

    console.log(firstPost.body);

    var sanitize = sanitizeHtml(firstPost.body, {
        allowedTags: ['p', 'div', 'span', 'b', 'i', 'em', 'strong'],
        transformTags: {
            p: 'span',
            div: 'span',
            b: 'span',
            em: 'span',
            strong: 'span',
            i: 'span'
        }
    });

    console.log(sanitize);

    var data = unfluff(firstPost.body);

    request({
        url: firstPost.link,
        timeout: 6000
    }, function (err, response, body) {
        if (err) {
            console.log(err.message);
            return;
        }

        var data = unfluff(body);
        console.log(data);
    });
}, function (err) {
    //console.log(err);
    process.exit();
});

/*
request({
    url: link,
    timeout: 6000
}, function (err, response, body) {
    if (err) {
        console.log(err.message);
        return;
    }

    var data = unfluff(body);
    console.log(data.image);
});*/
