var Server = require('common/service').Server,
    accountConfig = require('../../config'),
    configuration = require('configuration');

var server = new Server({
    port: configuration.get('applications-api:account:port')
});

// add routes
require('./routes')(server);

// connect to database
require("common/mongooseConnect").initConnection(accountConfig);