var rabbitConfig = require('../../config'),
    Queue = require('bull'),
    Q = require('q'),
    log = require('common/log')(module),
    _ = require('underscore');

var queues = {};

function getQueue(queueName) {
    if (!_.contains(rabbitConfig.get('queue:queues'), queueName)) {
        throw new Error("Queue don't containe " + queueName + ' queue');
    }

    if (!queues.queueName) {
        queues.queueName = Queue(queueName, rabbitConfig.get('queue:port'), rabbitConfig.get('queue:ip'));
    }

    return queues.queueName;
}

// calculate count job on requested queue
function countJobs(queues) {
    var def = Q.defer();

    if (!queues) {
        throw new Error('Cannot find queues');
    }

    if (queues.length == 0) {
        def.resolve(0);
    } else {
        var queuesInstances = _.map(queues, function (queue) {
                return getQueue(queue);
            }),
            promises = _.map(queuesInstances, function (queue) {
                return queue.count();
            });

        Q.all(promises).then(function () {
            // todo: make it more nice
            var args = Array.prototype.slice.call(arguments),
                count = 0;

            _.each(args[0], function (jobCount) {
                count += Number(jobCount);
            });

            def.resolve(count);
        }, function (err) {
            log.error(err);

            def.reject('Cannot get count');
        });
    }

    return def.promise;
}

exports.getQueue = getQueue;
exports.countJobs = countJobs;