var Server = require('common/service').Server,
    configuration = require('configuration'),
    oauthConfig = require('../../config');

var server = new Server({
    port: configuration.get('applications:oauth:services:api:port')
});

// add routes
require('./routes')(server);

// connect to database
require("common/mongooseConnect").initConnection(oauthConfig);