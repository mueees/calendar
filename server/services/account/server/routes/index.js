var rootController = require('../controllers/root'),
    userController = require('../controllers/user'),
    applicationController = require('../controllers/application'),
    passport = require('passport'),
    accountConfig = require('../config');

var prefix = '/api/v' + accountConfig.get('api:version');

module.exports = function (app, oauth2) {

    /*HOME*/
    app.get('/', rootController.home);

    /*USER*/
    app.post(prefix + '/signup', userController.signUp);
    app.post(prefix + '/signin', userController.signIn);
    app.get(prefix + '/confirmuser', userController.confirmuser);

    /*APPLICATION*/
    app.get(prefix + '/application/all',
        passport.authenticate('bearer', {session: false}),
        applicationController.getAll);

    app.get(prefix + '/application/:id',
        passport.authenticate('bearer', {session: false}),
        applicationController.getById);


    /*OAUTH 2*/

    //
    /*app.post(prefix + '/oauth/auth', oauth2.auth);
    app.post(prefix + '/oauth/exchange', oauth2.exchange);
    app.post(prefix + '/oauth/refresh', oauth2.refresh);*/
};