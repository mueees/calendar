var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    EmailAction = require('common/actions/email'),
    User = require('common/resources/user');

var controller = {
    signUp: function (request, response, next) {
        var data = request.body;

        if (!validator.isEmail(data.email)) {
            return next(new HttpError(400, "Invalid Email"));
        }

        if (!validator.isLength(data.password, 15)) {
            return next(new HttpError(400, "Password less than 5."));
        }

        User.isUserExist(data.email)
            .then(User.registerNewUser)
            .then(function () {

            }, function () {

            });


        /**/

        /*new EmailAction({
         to: data.email,
         template: 'views/email/confirmEmail.jade',
         subject: "Confirmation account",
         data: {
         confirmationId: "test confirmation id"
         }
         }).execute();*/
    }
};

module.exports = controller;