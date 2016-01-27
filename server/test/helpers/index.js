var Category = require('applications/rabbit/common/resources/category'),
    Feed = require('applications/rabbit/common/resources/feed'),
    Post = require('applications/rabbit/common/resources/post'),
    Error = require('applications/rabbit/common/resources/error'),
    Topic = require('applications/rabbit/common/resources/topic'),
    UserPostMap = require('applications/rabbit/common/resources/userPostMap'),
    FeedStatistic = require('applications/rabbit/common/resources/feedStatistic'),
    async = require('async'),
    Q = require('q');

function cleanRabbitDb() {
    var def = Q.defer();

    async.parallel([
        function (cb) {
            Category.remove({}, cb);
        },
        function (cb) {
            Error.remove({}, cb);
        },
        function (cb) {
            Post.remove({}, cb);
        },
        function (cb) {
            Topic.remove({}, cb);
        },
        function (cb) {
            UserPostMap.remove({}, cb);
        },
        function (cb) {
            Feed.remove({}, cb);
        },
        function (cb) {
            FeedStatistic.remove({}, cb);
        }
    ], function (err) {
        if(err){
            return def.reject(err);
        }

        def.resolve();
    });

    return def.promise;
}

module.exports = {
    cleanRabbitDb: cleanRabbitDb
};