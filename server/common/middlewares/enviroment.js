module.exports = function(req, res, next){
    if( process.env.NODE_ENV == "development" ){
        res.locals.production = false;
    }else{
        res.locals.production = true;
    }

    next();
};