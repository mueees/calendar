var nconf = require("nconf");
var path = require("path");
nconf.file('api.main', {file: path.join(__dirname, 'main.json')});
module.exports = nconf;