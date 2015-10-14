module.exports = function(req, res, next){
    res.sendHttpError = function(error){
        if( req.headers['x-requested-with'] == "XMLHttpRequest" || req.headers['mue-inner-request'] == "true" ){
            res.status( error.status );
            res.send({
                message: error.message
            });
        } else {
            res.status( error.status );

            res.render('error', {
                message: error.message,
                status: error.status
            });
        }
    };

    next();
};