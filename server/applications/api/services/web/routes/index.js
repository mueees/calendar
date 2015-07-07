var isApiExist = require('../middlewares/isApiExist'),
    getAccessToken = require('../middlewares/getAccessToken'),
    apiRequest = require('../middlewares/apiRequest'),
    logRequest = require('../middlewares/log'),
    getPermission = require('../middlewares/getPermission');

module.exports = function (app) {
    app.use('/api/:application/*', [
        logRequest,
        isApiExist,
        getAccessToken,
        getPermission,
        apiRequest
    ]);
};