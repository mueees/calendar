var Server = require('common/service').Server,
    configuration = require('common/configuration');

var server = new Server({
    port: configuration.get('applications-api:calendar:port')
});

// add routes
require('./routes')(server);