define([
    'app'
], function (App) {
    return App.module('Core.Security', {
        define: function (Security) {
            function isAuth(){
                return false;
            }

            Security.isAuth = isAuth;
        }
    });
});