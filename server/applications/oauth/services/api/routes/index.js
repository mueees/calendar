var oauthserver = require('../modules/oauthserver'),
    oauthConfig = require('../../../config');

var api = {
    getServiceInfo: function (cb) {
        cb(null, {
            name: oauthConfig.get('name'),
            version: oauthConfig.get('version')
        });
    },

    auth: oauthserver.auth,

    exchange: oauthserver.exchange,

    refresh: oauthserver.refresh,

    getPermissionByAccessToken: oauthserver.getPermissionByAccessToken,

    createApplication: oauthserver.createApplication,

    getAllApplications: oauthserver.getAllApplications,

    removeApplication: oauthserver.removeApplication,

    getApplicationById: oauthserver.getApplicationById
};

module.exports = function (server) {
    server.api(api);
};