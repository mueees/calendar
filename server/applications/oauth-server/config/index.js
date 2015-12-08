var nconf = require("nconf"),
    config = new nconf.Provider(),
    path = require("path"),
    configFile;

var NODE_ENV = process.env.NODE_ENV;

if ((NODE_ENV == 'development')) {
    configFile = 'development.json'
} else if (NODE_ENV == 'test') {
    configFile = 'test.json'
} else if (NODE_ENV == 'production') {
    configFile = 'production.json'
}

config.file('oauth.main', {file: path.join(__dirname, 'main.json')});
config.file('oauth.secret', {file: path.join(__dirname, 'secret.json')});
config.file('oauth.configFile', {file: path.join(__dirname, configFile)});

module.exports = config;