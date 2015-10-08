var rabbitConfig = require('applications/rabbit/config'),
    Q = require('q'),
    Post = require('applications/rabbit/common/resources/post');

var settings = {
    postsBeforeTest: 10000
};

function createPost(post) {
    var def = Q.defer();

    Post.create(post, function (err) {
        if (err) {
            console.log('Cannot save post');
            console.log(err.message);
            return;
        }

        def.resolve()
    });

    return def.promise;
}

function getRandomPost() {
    return {
        title: 'This is title',
        data: 'This is data',
        calendarId: '4123reg45y4w53f34t5gq34tg'
    }
}

function fillPosts(count) {
    var postPromises = [];

    for (var i = 0; i < count; i++) {
        postPromises.push(createPost(getRandomPost()));
    }

    return postPromises;
}

function beforeTest() {
    return Q.all(fillPosts(settings.postsBeforeTest));
}

require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
    beforeTest().then(function () {
        var start = new Date();
        
        Post.remove({}, function (err) {
            process.exit();
        });
    });
});