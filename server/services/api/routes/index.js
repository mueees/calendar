var userController = require('../controllers/user'),
    apiConfig = require('../config'),
    prefix = '/api/v' + apiConfig.get('version');

module.exports = function (app) {

    /*USER*/
    app.post(prefix + '/user/signup', userController.signUp);
};