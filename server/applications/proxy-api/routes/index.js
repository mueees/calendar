var proxyConfig = require('../config'),
    configuration = require('configuration');

var isApiExist = require('../middlewares/isApiExist'),
    getAccessToken = require('../middlewares/getAccessToken'),
    getPermission = require('../middlewares/getPermission');

var applications = configuration.get('applications-api');

module.exports = function (app) {
    app.use('/api/:applicationName/*', [
        isApiExist,
        getAccessToken,
        getPermission,
        apiRequest,
        log
    ]);
};