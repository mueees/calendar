module.exports = function(request, response, next){
    if( process.env.NODE_ENV == "development" ){
        request.development = true;
        response.locals.production = request.production = false;
    }else{
        request.development = false;
        response.locals.production = request.production = true;
    }

    next();
};