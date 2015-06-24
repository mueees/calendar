var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    accessConfig = require('../../config'),
    configuration = require('configuration');

var app = express();

require('./auth');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json({type: 'application/json'}));

app.use(require("common/middlewares/sendHttpError"));
app.use(require("common/middlewares/enviroment"));

require("common/mongooseConnect").initConnection(accessConfig);

app.use(express.static('./public'));

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
server.listen(configuration.get("applications:oauth-access:services:web:port"));
console.log(configuration.get("applications:oauth-access:services:web:name") + " server listening: " + configuration.get("applications:oauth-access:services:web:port"));