var Client = require('common/service').Client,
    util = require('util');

var client = new Client({
    port: 3300,
    collectStats: false
});

client.on('remote', function () {
    client.exec('transform', 'mue', function (err, result) {
        if (err) {
            console.log(err.status);
            console.log(err.message);
        }
    });

    var data = {
        userId: '123123',
        body: {}
    };

    client.exec('request', '/user/info', data, function (err, result) {
        if (err) {
            return console.log(err);
        }

        console.log(result);
    });
});