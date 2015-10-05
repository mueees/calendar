var isApiExist = require('../middlewares/isApiExist'),
    getAccessToken = require('../middlewares/getAccessToken'),
    apiRequest = require('../middlewares/apiRequest'),
    getUserId = require('../middlewares/getUserId');

module.exports = function (app) {
    app.use('/api/:application/*', [
        isApiExist,
        getAccessToken,
        getUserId,
        apiRequest
    ]);
};