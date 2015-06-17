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
});