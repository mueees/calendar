var Server = require('common/service').Server,
    configuration = require('configuration');

var server = new Server({
    port: configuration.get('applications-api:test:port')
});

// add routes
require('./routes')(server);