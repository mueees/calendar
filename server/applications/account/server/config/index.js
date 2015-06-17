var nconf = require("nconf"),
    path = require("path"),
    configFile;

var NODE_ENV = process.env.NODE_ENV;

if((NODE_ENV == 'development')){
    configFile = 'development.json'
}else if(NODE_ENV == 'test'){
    configFile = 'test.json'
}else if(NODE_ENV == 'production'){
    configFile = 'live.json'
}

nconf.file('account.main', {file: path.join(__dirname, 'main.json')});
nconf.file('account.secret', {file: path.join(__dirname, 'secret.json')});
nconf.file('account.configFile', {file: path.join(__dirname, configFile)});

module.exports = nconf;