define([
    'core/resource/command',
    'config/app'
], function (Commands, config) {
    var prefix = '/api';

    Commands.register('signin', {
        url: prefix + '/signin',
        type: 'POST'
    });

    Commands.register('signup', {
        url: prefix + '/signup',
        type: 'POST'
    });

    Commands.register('logout', {
        url: prefix + '/logout',
        type: 'GET'
    });

    return Commands;
});