var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    globalConfig = require('config'),
    authConfig = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/x-www-form-urlencoded'}));

app.set('views', __dirname + "/views");
app.set('view engine', 'jade');

app.use(express.static('../client/bin/'));

//link database
require("common/mongooseConnect").initConnection(authConfig);

//routing
route(app);

var server = http.createServer(app);
server.listen(authConfig.get("service:port"));
console.log(authConfig.get("service:name") + ' server listening: ' + authConfig.get("service:port") + ' port');