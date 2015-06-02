var express = require('express'),
    route = require('./routes'),
    http = require('http'),
    HttpError = require('common/errors/HttpError'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    accountConfig = require('./config');

var app = express();

require('./auth');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({type: 'application/x-www-form-urlencoded'}));

app.set('views', __dirname + "/views");
app.set('view engine', 'jade');

if( process.env.NODE_ENV == "development" ){
    app.use(express.static('../client/build/app'));
}else{
    app.use(express.static('../client/bin/app'));
}

app.use(require("common/middlewares/sendHttpError"));

//routing
route(app);

app.use(function(err, req, res, next){
    if( typeof err == "number"){
        err = new HttpError(err);
    }

    if( err instanceof HttpError ){
        res.sendHttpError(err);
    }else{
        console.log('end error');
    }
});

//link database
require("common/mongooseConnect").initConnection(accountConfig);

var server = http.createServer(app);
server.listen(accountConfig.get("service:port"));
console.log(accountConfig.get("service:name") + ' server listening: ' + accountConfig.get("service:port") + ' port');