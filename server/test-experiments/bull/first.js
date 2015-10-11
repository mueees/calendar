var Queue = require('bull'),
    videoQueue = Queue('video transcoding', 6379, '127.0.0.1');

setInterval(function () {
    videoQueue.count().then(function (count) {
        if (count == 0) {
            videoQueue.add({
                title: 'test'
            });
        }
    });
}, 1000);

setInterval(function () {
    videoQueue.count().then(function (count) {
        console.log('In queue ' + count + ' tasks');
    });
}, 2000);