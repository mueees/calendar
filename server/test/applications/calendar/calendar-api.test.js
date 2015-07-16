var Client = require('common/service').Client,
    _ = require('underscore'),
    log = require('common/log')(module),
    configuration = require('configuration');
    require('applications/calendar/services/api');


describe('calendar-api', function () {
    var client = null;

    before(function (done) {
        //if(!client || !client.isConnected()) {
        //    client = new Client({
        //        port: configuration.get('applications-api:calendar:port'),
        //        collectStats: false
        //    });
        //    client.on('remote', function() {
        //        done();
        //    })
        //} else {
        //    done();
        //}

        //test

        console.log('before');

        client = new Client({
            port: configuration.get('applications-api:calendar:port'),
            collectStats: false
        });

        client.on('remote', function() {
            console.log(1);

            done();
        });
        //done();
    });

    it('should retreive version', function (done) {
        client.exec('request', '/version', function (err, data) {
            if (err) {
                done('err');
            }

            done();
        });
        //done();
    });

    //it('test', function (done) {
    //    done();
    //});

});
