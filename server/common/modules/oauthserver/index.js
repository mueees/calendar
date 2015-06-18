var Server = require('./server'),
    OauthError = require('./OauthError');

function createServer(){
    return new Server();
}

exports.createServer = createServer;
exports.OauthError = OauthError;