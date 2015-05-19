define([
    'core/resource/command'
], function (Commands) {
    Commands.register('signin', {
        url: 'api/v1/signin',
        type: 'POST'
    });

    Commands.register('signup', {
        url: 'api/v1/signup',
        type: 'POST'
    });

    Commands.register('logout', {
        url: 'api/v1/logout',
        type: 'POST'
    });

    return Commands;
});