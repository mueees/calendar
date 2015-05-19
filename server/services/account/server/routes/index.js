var rootController = require('../controllers/root'),
    userController = require('../controllers/user'),
    authConfig = require('../config');

var prefix = '/api/v' + authConfig.get('api:version');

module.exports = function (app) {

    /*HOME*/
    app.get('/', rootController.home);

    /*USER*/
    app.post(prefix + '/signup', userController.signUp);


    app.use(function(req, res, next){
        res.status(404);
        res.render('error', { status: 404, url: req.url });
    });

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
};