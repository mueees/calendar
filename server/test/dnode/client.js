var Client = require('common/service').Client,
    util = require('util');

var client = new Client({
    port: 3300,
    collectStats: false
});

client.on('remote', function () {
    client.exec('transform', 'mue', function (err, result) {
        if (err) {
            console.log("ERRRRRORRRR");
            return;
        }

        console.log("RESSSULT");
        console.log(result);
    });

    client.on('end', function () {
        console.log("RESPONSE ERROR");
    });

    client.exec('request', '/user/info', {
        userId: '123123',
        body: {}
    }, function (err, result) {
        if (err) {
            return console.log(err);
        }

        console.log(result);
    });
});