var Server = require('./server');

function createServer(){
    return new Server();
}

exports.createServer = createServer;