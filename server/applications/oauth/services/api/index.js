var Server = require('common/service').Server,
    configuration = require('common/configuration');

var server = new Server({
    port: configuration.get('applications:oauth:services:api:port')
});

// add routes
require('./routes')(server);