var Queue = require('../../common/queue'),
    Post = require('../../common/resources/post'),
    log = require('common/log')(module),
    rabbitConfig = require('../../config'),
    _ = require('underscore'),
    savePostQueue = Queue.getQueue('savePost');

var postsToSave = [],
    settings = {
        collectCount: 100,
        intervalPeriod: 15*1000 // seconds
    };

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig);

setInterval(function () {
    if (postsToSave.length) {
        log.info('Save because of interval');

        var posts = _.clone(postsToSave);

        postsToSave = [];

        Post.create(posts, function (err) {
            if (err) {
                log.error(err.message);
                return;
            }

            log.info(posts.length + ' was saved');
        });
    }
}, settings.intervalPeriod);

savePostQueue.process(function (job, done) {
    postsToSave.push(job.data.post);

    if (postsToSave.length > settings.collectCount) {
        var start = new Date();

        Post.create(postsToSave, function (err) {
            if (err) {
                log.error(err.message);
                postsToSave = [];
                return;
            }

            var executeTime = (new Date() - start) / 1000;

            log.info(postsToSave.length + ' was saved, it takes ' + executeTime + ' seconds');

            postsToSave = [];

            done();
        });
    } else {
        done();
    }
});