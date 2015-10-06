var Server = require('common/service').Server,
    calendarConfig = require('../../config'),
    configuration = require('configuration');

var server = new Server({
    port: configuration.get('applications-api:calendar:port')
});

// connect to database
require("common/mongooseConnect").initConnection(calendarConfig);

// add routes
require('./routes')(server);