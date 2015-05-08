var nconf = require("nconf");
var path = require("path");
var configFile;

var NODE_ENV = process.env.NODE_ENV;

if((NODE_ENV == 'development')){
    configFile = 'development.json'
}else if(NODE_ENV == 'test'){
    configFile = 'test.json'
}else if(NODE_ENV == 'live'){
    configFile = 'live.json'
}

nconf.file('main', {file: path.join(__dirname, 'main.json')});
nconf.file('secret', {file: path.join(__dirname, 'secret.json')});
nconf.file('configFile', {file: path.join(__dirname, configFile)});

console.log(__dirname);

module.exports = nconf;