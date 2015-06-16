var dnode = require('dnode');

var server = dnode({
    transform : function (s, cb) {
        setTimeout(cb, 3300);
    }
});

server.listen(5004);