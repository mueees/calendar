var Server = require('common/service').Server,
    configuration = require('common/configuration');

var server = new Server({
    port: configuration.get('applications:seed:services:api:port')
});

// add routes
require('./routes')(server);