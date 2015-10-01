var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    configuration = require('configuration');

var app = express();

app.use(bodyParser.json({type: 'application/json'}));

//routing
route(app);

app.use(function (err, req, res, next) {
    console.log(err);
});

http.createServer(app).listen(configuration.get("applications:oauth:services:web:port"));
console.log(configuration.get("applications:oauth:services:web:name") + ' server listening: ' + configuration.get("applications:oauth:services:web:port") + ' port');