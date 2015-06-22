var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    proxyConfig = require('../../config');

var app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json({type: 'application/json'}));

app.use(require("common/middlewares/sendHttpError"));
app.use(require("common/middlewares/enviroment"));

// listen routs
route(app);

app.use(function (err, req, res) {
    if (typeof err == "number") {
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        console.log('end error');
        console.log(err);
    }
});

var server = http.createServer(app);
server.listen(proxyConfig.get("port"));
console.log(proxyConfig.get('name') + " server listening: " + proxyConfig.get("port"));