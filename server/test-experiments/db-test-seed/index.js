var rabbitConfig = require('applications/rabbit/config'),
    Q = require('q'),
    testHelpers = require('test/helpers'),
    async = require('async'),
    mongooseConnect = require("common/mongooseConnect"),
    Post = require('applications/rabbit/common/resources/post'),
    Topic = require('applications/rabbit/common/resources/topic'),
    Feed = require('applications/rabbit/common/resources/feed');

function init() {
    return mongooseConnect.initConnection(rabbitConfig).then(testHelpers.cleanRabbitDb);
}

init().then(function () {
    // do test
});