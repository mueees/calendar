var seedConfig = require('../../../config');

var api = {
    request: function (cb) {
        cb(null, seedConfig.get('version'));
    }
};

module.exports = function (server) {
    server.api(api);

    server.addRoute('/user/info', function (data, cb) {
        cb(null, 'Request from: ' + data.userId + '. This is user info');
    });
};