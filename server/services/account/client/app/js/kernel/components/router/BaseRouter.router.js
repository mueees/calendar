define([
    'marionette',
    'kernel/security/security.service'
], function (Marionette, $mSecurity) {
    return Marionette.AppRouter.extend({
        before: function (route, name, access) {
            if (access.auth && !$mSecurity.isAuth()) {
                this.authError(route, name, access);
                return false;
            }
        },

        authError: function () {
        }
    });
});