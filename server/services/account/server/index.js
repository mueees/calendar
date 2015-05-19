var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    authConfig = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/x-www-form-urlencoded'}));

app.set('views', __dirname + "/views");
app.set('view engine', 'jade');

if( process.env.NODE_ENV == "development" ){
    app.use(express.static('../client/build/app'));
}else{
    app.use(express.static('../client/bin/app'));
}

app.use(require("common/middlewares/sendHttpError"));

//link database
require("common/mongooseConnect").initConnection(authConfig);

//routing
route(app);

app.use(function(err, req, res, next){
    if( typeof err == "number"){
        err = new HttpError(err);
    }

    if( err instanceof HttpError ){
        res.sendHttpError(err);
    }else{
        if( app.get("env") == "development" ){
            express.errorHandler()(err, req, res, next);
        }else{
            express.errorHandler()(err, req, res, next);
            res.send(500);
        }
    }
});

var server = http.createServer(app);
server.listen(authConfig.get("service:port"));
console.log(authConfig.get("service:name") + ' server listening: ' + authConfig.get("service:port") + ' port');