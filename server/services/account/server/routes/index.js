var rootController = require('../controllers/root');
var userController = require('../controllers/user');

module.exports = function (app) {

    /*HOME*/
    app.get('/', rootController.home);

    /*USER*/
    app.get('/signup', userController.signUp);
};