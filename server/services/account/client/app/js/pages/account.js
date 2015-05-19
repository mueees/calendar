require([
    'app',

    'core/ajaxInterceptors/ajaxInterceptors.service',

    // ajax commands
    'kernel/resource/commands/index',

    // screens
    'apps/account/screens/sign/module'
], function (App) {
    App.start();
});