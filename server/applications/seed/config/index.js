var nconf = require("nconf");
var path = require("path");
var configFile;

var NODE_ENV = process.env.NODE_ENV;

if((NODE_ENV == 'development')){
    configFile = 'development.json'
}else if(NODE_ENV == 'test'){
    configFile = 'test.json'
}else if(NODE_ENV == 'production'){
    configFile = 'production.json'
}

nconf.file('main.main', {file: path.join(__dirname, 'main.json')});
nconf.file('main.secret', {file: path.join(__dirname, 'secret.json')});
nconf.file('main.configFile', {file: path.join(__dirname, configFile)});

module.exports = nconf;