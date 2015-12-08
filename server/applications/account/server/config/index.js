var nconf = require("nconf"),
    path = require("path"),
    config = new nconf.Provider(),
    configFile;

var NODE_ENV = process.env.NODE_ENV;

if ((NODE_ENV == 'development')) {
    configFile = 'development.json'
} else if (NODE_ENV == 'test') {
    configFile = 'test.json'
} else if (NODE_ENV == 'production') {
    configFile = 'production.json'
}


config.file('account.main', {file: path.join(__dirname, 'main.json')});
config.file('account.secret', {file: path.join(__dirname, 'secret.json')});
config.file('account.configFile', {file: path.join(__dirname, configFile)});

module.exports = config;