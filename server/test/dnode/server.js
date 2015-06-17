var service = require('common/service'),
    Server = service.Server,
    ServerError = service.ServerError,
    _ = require('underscore'),
    util = require('util');

var server = new Server({
    port: 3300
});

server.api({
    transform: function (s, cb) {
        setTimeout(function(){
            cb(new ServerError(500, 'Cannot find anything'));
        }, 450);
    },

    getVersion: function (cb) {
        cb(null, 1);
    }
});