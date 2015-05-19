var validator = require('validator');

var controller = {
    signUp: function (request, response, next) {
        var data = request.body;

        if( !validator.isEmail(data.email) ) {
            return next(new HttpError(400, "Invalid Email"));
        }

        if( !validator.isLength(data.password, 5) ){
            return next(new HttpError(400, "Password least than 5."));
        }
    }
};

module.exports = controller;