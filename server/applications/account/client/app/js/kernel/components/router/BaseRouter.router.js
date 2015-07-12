define([
    'app',
    'marionette',
    'kernel/security/security.service',

    'clientCore/router/before-resolve.extend'
], function (App, Marionette, $mSecurity) {
    return Marionette.AppRouter.extend({
        before: function (route, name, access) {
            var isAuth = $mSecurity.isAuth();

            if (access.auth) {
                if (!isAuth) {
                    $mSecurity.setAfterAuth({
                        fragment: route
                    });

                    this.authError(route, name, access);
                    $mSecurity.navigateToSign(route, name, access);

                    return false;
                }
            } else if (access.redirectIfAuth && isAuth) {
                App.navigate('#' + access.redirectIfAuth.fragment, {
                    trigger: true
                });

                return false;
            }
        },

        authError: function (route, name, access) {
        }
    });
});