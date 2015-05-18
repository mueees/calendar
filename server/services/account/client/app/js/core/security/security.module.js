define([
    'app',
    'storage',
    'core/resource/user'
], function (App, storage, User) {
    return App.module('Core.Security', {
        define: function (Security) {
            var user = storage.get('user');

            function isAuth() {
                return user;
            }

            function login(credentials) {
                User.login(credentials).then(function (access_token) {

                });
            }

            function logout() {
                User.logout();
            }

            Security.isAuth = isAuth;
            Security.login = login;
            Security.logout = logout;

            App.addInitializer(function () {
            });
        }
    });
});