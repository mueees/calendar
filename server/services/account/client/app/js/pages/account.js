require([
    'app',

    // ajax commands
    'kernel/resource/commands/index',

    // screens
    'apps/account/screens/signup/module'
], function (App) {
    App.start();
});