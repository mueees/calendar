var seedConfig = require('../../../config');

var api = {
    request: function (cb) {
        cb(null, seedConfig.get('version'));
    }
};

module.exports = function (server) {
    server.api(api);
};