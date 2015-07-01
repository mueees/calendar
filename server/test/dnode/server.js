var service = require('common/service'),
    Server = service.Server,
    ServerError = service.ServerError,
    _ = require('underscore'),
    util = require('util');

var server = new Server({
    port: 3300
});

server.addRoute('/user/info', function (data, cb) {
    cb(null, 'Request from: ' + data.userId + '. This is user info');
});

server.addRoute('/user/info', function (data, cb) {
    cb(null, 'This is user info');
});/**/

server.api({
    transform: function (s, cb) {
        setTimeout(function () {
            cb(null, s.toUpperCase());
        }, 4000);
    },

    getVersion: function (cb) {
        cb(null, 1);
    }
});