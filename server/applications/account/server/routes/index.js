var rootController = require('../controllers/root'),
    userController = require('../controllers/user'),
    oauthController = require('../controllers/oauth'),
    applicationController = require('../controllers/application'),
    passport = require('passport'),
    accountConfig = require('../config');

var prefix = '/api/v' + accountConfig.get('api:version');

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

    app.post(prefix + '/application/create',
        passport.authenticate('bearer', {session: false}),
        applicationController.create);

    app.post(prefix + '/application/remove/:id',
        passport.authenticate('bearer', {session: false}),
        applicationController.remove);

    app.get(prefix + '/application/:id',
        passport.authenticate('bearer', {session: false}),
        applicationController.getById);

    /*OAUTH 2*/
    app.post(prefix + '/oauth/auth',
        passport.authenticate('bearer', {session: false}),
        oauthController.auth);

    app.post(prefix + '/oauth/exchange',
        oauthController.exchange);

    app.post(prefix + '/oauth/refresh',
        oauthController.refresh);
};