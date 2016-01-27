var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    configuration = require('configuration'),
    calendarConfig = require('../../config');

var app = express();

app.use(bodyParser.json({
    strict: false
}));

app.use(require("common/middlewares/sendHttpError"));
app.use(require("common/middlewares/onlyForUsers"));

//routing
route(app);

app.use(function (err, req, res, next) {
    if (typeof err == "number") {
        err = new HttpError(err);
    } else if (err instanceof HttpError) {

    } else {
        err = new HttpError(500, 'Fatal server error');
    }

    res.sendHttpError(err);
});

// connect to database
require("common/mongooseConnect").initConnection(calendarConfig);

var servicePort = configuration.get("applications:calendar:services:api:port");

http.createServer(app).listen(servicePort);

log.info(configuration.get("applications:calendar:services:api:name") + ' server listening: ' + servicePort + ' port');