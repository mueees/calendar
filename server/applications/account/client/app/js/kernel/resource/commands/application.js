define([
    'clientCore/resource/command',
    'config/app'
], function (Commands, config) {
    var prefix = '/api';

    Commands.register('application:approve', {
        url: prefix + '/oauth/auth',
        type: 'POST'
    });

    return Commands;
});