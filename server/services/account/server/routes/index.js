var rootController = require('../controllers/root'),
    userController = require('../controllers/user'),
    applicationController = require('../controllers/application'),
    passport = require('passport'),
    authConfig = require('../config');

var prefix = '/api/v' + authConfig.get('api:version');

module.exports = function (app) {

    /*HOME*/
    app.get('/', rootController.home);

    /*USER*/
    app.post(prefix + '/signup', userController.signUp);
    app.post(prefix + '/signin', userController.signIn);
    app.get(prefix + '/confirmuser', userController.confirmuser);

    /*APPLICATION*/
    app.get(prefix + '/application/:id',
        passport.authenticate('bearer', { session: false }),
        applicationController.getById);
};