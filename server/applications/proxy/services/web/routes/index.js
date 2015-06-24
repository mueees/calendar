var isApiExist = require('../middlewares/isApiExist'),
    getAccessToken = require('../middlewares/getAccessToken'),
    apiRequest = require('../middlewares/apiRequest'),
    log = require('../middlewares/log'),
    getPermission = require('../middlewares/getPermission');

module.exports = function (app) {
    app.use('/api/:application/*', [
        isApiExist,
        getAccessToken,
        getPermission,
        apiRequest,
        log
    ]);
};