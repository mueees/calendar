var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    config = require('config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/x-www-form-urlencoded'}));

//link database
require("common/mongooseConnect");

//routing
route(app);

var server = http.createServer(app);
server.listen(config.get("services:api:port"));
console.log("Web server listening: " + config.get("services:api:port"));