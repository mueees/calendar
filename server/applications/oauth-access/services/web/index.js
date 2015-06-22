var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    accessConfig = require('../../config');

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
    }
});

var server = http.createServer(app);
server.listen(accessConfig.get("port"));
console.log(accessConfig.get('name') + " server listening: " + accessConfig.get("port"));