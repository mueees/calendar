var Queue = require('bull'),
    videoQueue = Queue('video transcoding', 6379, '127.0.0.1');

videoQueue.process(function (job, done) {
    console.log('start');

    setTimeout(function () {
        console.log('end');
        done();
    }, 500);
});