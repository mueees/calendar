var nconf = require("nconf"),
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

nconf.file('rss.main', {file: path.join(__dirname, 'main.json')});
nconf.file('rss.secret', {file: path.join(__dirname, 'secret.json')});
nconf.file('rss.configFile', {file: path.join(__dirname, configFile)});

module.exports = nconf;