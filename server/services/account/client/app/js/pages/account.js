require([
    'app',

    'core/ajax/ajax.service',

    // ajax commands
    'kernel/resource/commands/index',

    //init
    'apps/account/init/index',

    'kernel/fake-server/fake-server.service',

    // screens
    'apps/account/screens/sign/module',
    'apps/account/screens/dashboard/module',
    'apps/account/screens/application-approval/module'
], function (App) {
    App.start();
});