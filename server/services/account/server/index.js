var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    config = require('config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/x-www-form-urlencoded'}));

app.use(express.static('../client/bin/'));

//link database
require("common/mongooseConnect");

//routing
route(app);

var server = http.createServer(app);
server.listen(config.get("services:account:port"));
console.log("Web server listening: " + config.get("services:account:port"));