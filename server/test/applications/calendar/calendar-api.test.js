var Client = require('common/service').Client,
    _ = require('underscore'),
    log = require('common/log')(module),
    assert = require('assert'),
    configuration = require('configuration');
    require('applications/calendar/services/api');


describe('calendar-api', function () {
    var client = null;

    before(function (done) {
        client = new Client({
            port: configuration.get('applications-api:calendar:port')
        });

        client.on('remote', function() {
            console.log('==remote==');
            done();
        });
    });
    //
    //it('should retreive version in right format', function (done) {
    //    client.exec('request', '/version', function (err, data) {
    //        if (err) {
    //            done('err');
    //        }
    //
    //        if (_.isNumber(data.version)) {
    //            done();
    //        } else {
    //            var error = new Error("Version is not in correct format");
    //            done(error);
    //        }
    //    });
    //});

    it('should create calendar', function (done) {
        console.log('=====TEST========');

        client.exec('request', '/calendar/create', {
            name: 'Test',
            description: 'It is used in tests'
        }, function (err, data) {
            console.log('====Clalback===');
           done();
        });
    });

});
