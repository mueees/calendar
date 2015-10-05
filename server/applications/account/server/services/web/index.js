var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    accountConfig = require('../../config'),
    log = require('common/log')(module),
    configuration = require('configuration');

var app = express();

require('./auth');

app.use(bodyParser.json({type: 'application/json'}));

app.set('views', __dirname + "/views");
app.set('view engine', 'jade');

if (process.env.NODE_ENV == "development") {
    app.use(express.static('../../../client/build/app'));
} else {
    app.use(express.static('../../../client/bin/app'));
}

app.use(require("common/middlewares/sendHttpError"));
app.use(require("common/middlewares/enviroment"));

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
        log.error(err.message);
    }
});

// connect to database
require("common/mongooseConnect").initConnection(accountConfig);

http.createServer(app).listen(configuration.get("applications:account:services:web:port"));
console.log(configuration.get("applications:account:services:web:name") + ' server listening: ' + configuration.get("applications:account:services:web:port") + ' port');