var Client = require('common/service').Client,
    configuration = require('configuration'),
    util = require('util');

var oauth = new Client({
    port: configuration.get('applications:oauth:services:api:port')
});

module.exports = oauth;