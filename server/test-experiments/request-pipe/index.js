var request = require('request');

request({
    method: 'POST',
    url: 'http://localhost:9002/api/application/create'
}, function (err, response, data) {
    data = JSON.parse(data);

    console.log(data);
    console.log(data._id);
});