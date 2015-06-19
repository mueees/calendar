var seedConfig = require('../../../config');

var api = {};

module.exports = function (server) {
    server.api(api);

    server.addRoute('/application/version', function (data, cb) {
        cb(null, {
            version: seedConfig.get('version')
        });
    });

    server.addRoute('/application/echo', function (data, cb) {
        cb(null, data);
    });
};