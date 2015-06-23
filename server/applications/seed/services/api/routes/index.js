var seedConfig = require('../../../config');

var api = {
    getVersion: function (cb) {
        cb(null, seedConfig.get('version'));
    }
};

module.exports = function (server) {
    server.api(api);
};