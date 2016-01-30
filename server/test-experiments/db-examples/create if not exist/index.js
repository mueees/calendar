var rabbitConfig = require('applications/rabbit/config'),
    Q = require('q'),
    testHelpers = require('test/helpers'),
    async = require('async'),
    _ = require('lodash'),
    log = require('common/log')(module),
    mongooseConnect = require("common/mongooseConnect"),
    Post = require('applications/rabbit/common/resources/post'),
    Topic = require('applications/rabbit/common/resources/topic'),
    Error = require('applications/rabbit/common/resources/error'),
    Feed = require('applications/rabbit/common/resources/feed');

function init() {
    return mongooseConnect.initConnection(rabbitConfig).then(testHelpers.cleanRabbitDb);
}

function processError(err) {
    log.error(err);

    process.exit();
}

init().then(function () {
    var errorData = {
        errorCode: 1,
        data: {
            feedId: '5682b6f8bbd6fb9e4fcda241'
        }
    };

    Error.create(errorData, function (err) {
        if (err) {
            processError(err);
        }

        Error.update(
            errorData,
            errorData,
            {
                upsert: true
            },
            function (err) {
                if (err) {
                    processError(err);
                }

                Error.find({}, function (err, errors) {
                    if (err) {
                        processError(err);
                    }

                    log.info(errors);
                    process.exit();
                })
            }
        );
    });
});