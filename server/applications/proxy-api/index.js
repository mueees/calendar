var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    proxyConfig = require('./config');

var app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json({type: 'application/json'}));

// listen routs
route(app);

var server = http.createServer(app);
server.listen(proxyConfig.get("port"));
console.log(proxyConfig.get('name') + " server listening: " + proxyConfig.get("port"));