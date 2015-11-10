var unfluff = require('unfluff'),
    request = require('request'),
    async = require('async'),
    os = require('os'),
    Q = require('q'),
    sanitizeHtml = require('sanitize-html'),
    Feed = require('../../applications/rabbit/common/resources/feed'),
    linkFeed = 'http://feeds.gawker.com/lifehacker/vip',
    linkPost = 'http://edition.cnn.com/2015/11/03/africa/russian-plane-crash-egypt-sinai/index.html';


var tasks = [];

for(var i = 0; i < 10000; i++) {
    tasks.push(function (cb) {
        getPost().then(function () {
            console.log(process.memoryUsage());

            cb();
        }, function(err){
            cb(err)
        });
    });
}

async.series(tasks, function (err, result) {
    process.exit();
});


function getPost() {
    var defer = Q.defer();

    request({
        url: linkPost,
        timeout: 6000
    }, function (err, response, body) {
        if (err) {
            defer.reject(err);
            return;
        }

        //body = unfluff(body);

        defer.resolve(body);
    });

    return defer.promise;
}