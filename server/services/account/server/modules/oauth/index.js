var Server = require('./server');

exports.createServer = function () {
    var server = new Server();
    return server;
};