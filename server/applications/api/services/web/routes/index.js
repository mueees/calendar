var isApiExist = require('../middlewares/isApiExist'),
    getAccessToken = require('../middlewares/getAccessToken'),
    apiRequest = require('../middlewares/apiRequest'),
    getUserId = require('../middlewares/getUserId');

module.exports = function (app) {
    app.use('/api/admin/:application/*', [
        isApiExist,
        getAccessToken,
        getUserId,
        apiRequest
    ]);

    app.post('/api/:application/exchange', [
        isApiExist,
        apiRequest
    ]);

    app.post('/api/:application/refresh', [
        isApiExist,
        apiRequest
    ]);

    app.use('/api/:application/*', [
        isApiExist,
        getAccessToken,
        getUserId,
        apiRequest
    ]);
};