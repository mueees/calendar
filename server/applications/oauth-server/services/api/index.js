var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    configuration = require('configuration'),
    oauthConfig = require('../../config');

var app = express();

app.use(bodyParser.json({
    strict: false
}));

app.use(require("common/middlewares/sendHttpError"));

//routing
route(app);

app.use(function (err, req, res, next) {
    if (typeof err == "number") {
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        res.status(500);
        res.send('Fatal server error');
    }
});

// connect to database
require("common/mongooseConnect").initConnection(oauthConfig);

var servicePort = configuration.get("applications:oauth:services:api:port");

http.createServer(app).listen(servicePort);

log.info(configuration.get("applications:oauth:services:api:name") + ' server listening: ' + servicePort + ' port');