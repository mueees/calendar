var rabbitConfig = require('applications/rabbit/config'),
    Q = require('q'),
    testHelpers = require('test/helpers'),
    async = require('async'),
    _ = require('lodash'),
    log = require('common/log')(module),
    mongooseConnect = require("common/mongooseConnect"),
    Post = require('applications/rabbit/common/resources/post'),
    Topic = require('applications/rabbit/common/resources/topic'),
    Feed = require('applications/rabbit/common/resources/feed');

function init() {
    return mongooseConnect.initConnection(rabbitConfig).then(testHelpers.cleanRabbitDb);
}


init().then(function () {
    async.parallel([
        function (cb) {
            Feed.create({
                url: 'test1',
                topics: ['5682b6f8bbd6fb9e4fcda24d', '5682b6f8bbd6fb9e4fcda241']
            }, cb);
        },
        function (cb) {
            Feed.create({
                url: 'test2',
                topics: ['5682b6f8bbd6fb9e4fcda24d', '5682b6f8bbd6fb9e4fcda242']
            }, cb);
        }
    ], function (err) {
        if (err) {
            log.error(err);
            process.exit();
        }

        Feed.update({}, {
                $pull: {
                    topics: '5682b6f8bbd6fb9e4fcda24d'
                }
            }, {multi: true}
            , function (err) {});
    });
});