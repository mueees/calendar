var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    EmailAction = require('common/actions/email'),
    configuration = require("configuration"),
    accountConfig = require("../../../config"),
    User = require('common/resources/user');

var controller = {
    confirmuser: function (request, response, next) {
        var confirmationId = request.query.confirmationId;

        if (!confirmationId) {
            return next(new HttpError(400, {
                message: 'Cannot find confirmation id'
            }));
        }

        async.waterfall([
            function (cb) {
                User.isHaveConfirmationId(confirmationId, cb);
            },
            function (user, cb) {
                if (!user) {
                    return cb("Doesn't have user with this confirmation id");
                }
                user.confirm(cb);
            }
        ], function (err) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.redirect('/');
        });
    },

    sign: function (request, response, next) {
        var data = request.body;

        if (!validator.isEmail(data.email)) {
            return next(new HttpError(400, "Invalid Email"));
        }

        if (!validator.isLength(data.password, 5)) {
            return next(new HttpError(400, "Password less than 5."));
        }

        User.isUserExist(data.email, function (err, user) {
            if(err){
                if (err) {
                    return next(new HttpError(400, err));
                }
            }

            if(user) {
                // this is sign in
                async.waterfall([
                    function(callback){
                        User.isRightCredential(data.email, data.password, callback);
                    },
                    function (user, callback){
                        if (!user.isConfirm()) {
                            return callback("Please confirm account. Check your email");
                        }

                        user.generateAccountToken(callback);
                    }
                ], function (err, token) {
                    if (err) {
                        return next(new HttpError(400, err));
                    }

                    response.send(token);
                });
            }else {
                // this is sign up
                User.signup(data.email, data.password, function(err, user){
                    if (err) {
                        return next(new HttpError(400, err));
                    }

                    response.status(200);
                    response.send({
                        _id: user._id
                    });

                    new EmailAction({
                        to: data.email,
                        template: 'views/email/confirmEmail.jade',
                        subject: "Confirmation account",
                        data: {
                            host: (request.production) ? configuration.get('applications:account:services:web:domain') : 'http://localhost:' + configuration.get('applications:account:services:web:port'),
                            confirmationId: user.confirmationId,
                            application: configuration.get('project:name'),
                            apiVersion: accountConfig.get('api:version')
                        }
                    }).execute();
                });
            }
        });
    },

    logout: function (request, response, next) {
        // todo: implement logout method
        response.send({});
    }
};

module.exports = controller;