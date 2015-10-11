var rabbitConfig = require('applications/rabbit/config'),
    Q = require('q'),
    Post = require('applications/rabbit/common/resources/post');

var settings = {
    postsBeforeTest: 10000,
    batchPost: 100
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
        title: "I've decided to stop writing DailyJS.",
        data: "I've decided to stop writing DailyJS. It's part of my weekday ritual, and so it's a difficult decision " +
        "to make, but it's time to move on to other things." +
        "I love writing regularly, but mistakes have started to creep in that mean it's difficult for me to publish articles" +
        " with the level of confidence that I'd like.There's been a small community of contributors that have made DailyJS " +
        "great and encouraged me to keep going since 2009, and the readers have always been friendly and fun to talk to. Thank you!" +
        "During my hiatus from blogging I'm going to help finish Node.js in Action, Second Edition. I really want it to be a solid and " +
        "broad introduction to Node, so I'm excited about working on it.I'm going to do other technical writing. I'm not sure" +
        " what exactly, but if you're interested in working with me then you can find me at alex_young on Twitter." +
        "If anyone wants to take over DailyJS then please get in touch!",
        calendarId: '4123reg45y4w53f34t5gq34tg'
    }
}

function getRandomPosts(count) {
    var posts = [];

    for (var i = 0; i < count; i++) {
        posts.push(getRandomPost());
    }

    return posts;
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

        Q.all(fillPosts(settings.batchPost)).then(function () {
            var time = ((new Date()) - start) / 1000; // seconds

            console.log('Append ' + settings.batchPost + ' posts as single : ' + time);
        });

        // append batch of posts
        /*Post.create(getRandomPosts(settings.batchPost), function (err, posts) {
            if (err) {
                console.log(err.message);
                return;
            }

            var time = ((new Date()) - start) / 1000; // seconds

            console.log('Append ' + settings.batchPost + ' posts as batch: ' + time);

            Post.remove({}, function (err) {
                process.exit();
            });
        });*/
    });
});