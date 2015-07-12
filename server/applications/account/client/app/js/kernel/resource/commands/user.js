define([
    'clientCore/resource/command',
    'config/app'
], function (Commands, config) {
    var prefix = '/api';

    Commands.register('sign', {
        url: prefix + '/sign',
        type: 'POST'
    });

    Commands.register('logout', {
        url: prefix + '/logout',
        type: 'GET'
    });

    return Commands;
});