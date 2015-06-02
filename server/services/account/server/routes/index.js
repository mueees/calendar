var rootController = require('../controllers/root'),
    userController = require('../controllers/user'),
    authConfig = require('../config');

var prefix = '/api/v' + authConfig.get('api:version');

module.exports = function (app) {

    /*HOME*/
    app.get('/', rootController.home);

    /*USER*/
    app.post(prefix + '/signup', userController.signUp);
};