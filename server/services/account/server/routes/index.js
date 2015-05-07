var userController = require('../controllers/user');

module.exports = function (app) {

    /*USER*/
    app.get('/signup', userController.signUp);
};