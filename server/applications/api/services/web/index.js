var express = require('express'),
    route = require('./routes'),
    log = require('common/log')(module),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    configuration = require('configuration');

var app = express();

app.use(bodyParser.json({type: 'application/json'}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(require("common/middlewares/sendHttpError"));
app.use(require("common/middlewares/enviroment"));

// listen routs
route(app);

app.use(function (err, req, res, next) {

    if (typeof err == "number") {
        err = new HttpError(err);
    } else if (err instanceof HttpError) {

    } else {
        log.error(err);

        err = new HttpError(500, 'Fatal server error');
    }

    res.sendHttpError(err);
});

var server = http.createServer(app),
    servicePort = configuration.get("applications:api:services:web:port");

server.listen(servicePort);
log.info(configuration.get("applications:api:services:web:name") + " server listening: " + servicePort);