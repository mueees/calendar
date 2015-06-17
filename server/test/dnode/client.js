var Client = require('common/service').Client,
    util = require('util');

var client = new Client({
    port: 3300
});

client.on('remote', function () {
    setInterval(function () {
        client.exec('transform', 'mue', function (err, result) {});
    }, 2);

    setInterval(function () {
        console.log('Average Response Time: ' + client.getStats().averageResponseTime);
    }, 5000);
});