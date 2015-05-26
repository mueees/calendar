define([
    'core/resource/command',
    'config/app'
], function (Commands, config) {
    var prefix = '/api/v' + config.api.version;

    Commands.register('application:approve', {
        url: prefix + '/application/approve',
        type: 'POST'
    });

    return Commands;
});