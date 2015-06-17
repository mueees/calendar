var Server = require('common/service').Server,
    _ = require('underscore'),
    util = require('util');

var server = new Server({
    port: 3300
});

server.api({
    transform: function (s, cb) {
        setTimeout(function(){
            cb(null, 'Answer: ' + s);
        }, 450);
    },

    getVersion: function (cb) {
        cb(null, 1);
    }
});