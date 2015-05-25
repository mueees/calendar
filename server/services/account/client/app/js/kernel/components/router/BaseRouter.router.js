define([
    'app',
    'marionette',
    'kernel/security/security.service',

    'core/router/before-resolve.extend'
], function (App, Marionette, $mSecurity) {
    return Marionette.AppRouter.extend({
        before: function (route, name, access) {
            if (access.auth) {
                if (!$mSecurity.isAuth()) {
                    this.authError(route, name, access);
                    this.navigateToSign(route, name, access);

                    return false;
                }
            } else if (access.redirectIfAuth) {
                App.navigate('#' + access.redirectIfAuth.fragment, {
                    trigger: true
                });

                return false;
            }
        },

        authError: function (route, name, access) {

        },

        navigateToSign: function (route, name, access) {
            App.navigate('#' + $mSecurity.getSignPage().fragment, {
                trigger: true
            });
        }
    });
});