var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    EmailAction = require('common/actions/email'),
    configuration = require("configuration"),
    accountConfig = require("../config"),
    User = require('common/resources/user');

var controller = {
    signUp: function (request, response, next) {
        var data = request.body;

        if (!validator.isEmail(data.email)) {
            return next(new HttpError(400, "Invalid Email"));
        }

        if (!validator.isLength(data.password, 5)) {
            return next(new HttpError(400, "Password less than 5."));
        }

        async.waterfall([
            function (cb) {
                User.isUserExist(data.email, cb);
            },
            function (user, cb) {
                if( user ){
                    return cb("User with same email already registered");
                }else{
                    cb(null);
                }
            },
            function (cb) {
                User.signup(data.email, data.password, cb);
            }
        ], function (err, user) {
            if(err) {
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
                    confirmationId: user.confirmationId,
                    application: configuration.get('project:name'),
                    apiVersion: accountConfig.get('api:version')
                }
            }).execute();
        });
    },

    confirmuser: function (request, response, next) {
        var confirmationId = request.query.confirmationId;

        if(!confirmationId){
            return next(new HttpError(400, {
                message: 'Cannot find confirmation id'
            }));
        }

        async.waterfall([
            function (cb) {
                User.isHaveConfirmationId(confirmationId, cb);
            },
            function (user, cb) {
                if(!user){
                    return cb("Doesn't have user with this confirmation id");
                }
                user.confirm(cb);
            }
        ], function (err) {
            if(err){
                return next(new HttpError(400, err));
            }

            response.redirect('/');
        });
    },

    signIn: function (request, response, next) {
        var data = request.body;

        if (!validator.isEmail(data.email)) {
            return next(new HttpError(400, "Invalid Email"));
        }

        if (!validator.isLength(data.password, 5)) {
            return next(new HttpError(400, "Password less than 5."));
        }

        async.waterfall([
            function (cb) {
                User.isRightCredential(data.email, data.password, cb);
            },
            function (user, cb) {
                if(!user.isConfirm()){
                    return cb("Please confirm account. Check your email");
                }

                user.generateAccountToken(cb);
            }
        ], function (err, token) {
            if(err) {
                return next(new HttpError(400, err));
            }

            response.send(token);
        });
    }
};

module.exports = controller;