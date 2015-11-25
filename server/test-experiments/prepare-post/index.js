var async = require('async'),
    PreparePost = require('applications/rabbit/common/modules/prepare-post'),
    linkPost = 'http://edition.cnn.com/2015/11/03/africa/russian-plane-crash-egypt-sinai/index.html';

var tasks = [];

for (var i = 0; i < 10000; i++) {
    tasks.push(function (cb) {
        PreparePost.prepare({
            link: linkPost
        }).then(function () {
            console.log(process.memoryUsage());

            cb();
        }, function (err) {
            cb(err)
        });
    });
}

async.series(tasks, function () {
    process.exit();
});