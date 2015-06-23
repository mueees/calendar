var rootController = require('../controllers/root'),
    userController = require('../controllers/user'),
    oauthController = require('../controllers/oauth'),
    applicationController = require('../controllers/application'),
    passport = require('passport'),
    configuration = require('configuration');

var prefix = '/api/v' + configuration.get("applications:account:services:web:version");

module.exports = function (app) {

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

    app.get(prefix + '/application/by/applicationid/:id',
        passport.authenticate('bearer', {session: false}),
        applicationController.getByApplicationId);

    app.post(prefix + '/application/create',
        passport.authenticate('bearer', {session: false}),
        applicationController.create);

    app.post(prefix + '/application/remove/:id',
        passport.authenticate('bearer', {session: false}),
        applicationController.remove);

    /*OAUTH 2*/
    app.post(prefix + '/oauth/auth',
        passport.authenticate('bearer', {session: false}),
        oauthController.auth);

    app.post(prefix + '/oauth/exchange',
        oauthController.exchange);

    app.post(prefix + '/oauth/refresh',
        oauthController.refresh);
};