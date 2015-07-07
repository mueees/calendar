var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    accessConfig = require('../../config'),
    log = require('common/log')(module),
    configuration = require('configuration');

var app = express();

require('./auth');

app.use(bodyParser.json({type: 'application/json'}));

app.set('views', __dirname + "/views");
app.set('view engine', 'jade');

app.use(require("common/middlewares/sendHttpError"));
app.use(require("common/middlewares/enviroment"));

require("common/mongooseConnect").initConnection(accessConfig);

app.use(express.static('./public'));

// listen routs
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

http.createServer(app).listen(configuration.get("applications:proxy:services:web:port"));
log.info(configuration.get("applications:proxy:services:web:name") + " server listening: " + configuration.get("applications:proxy:services:web:port"));