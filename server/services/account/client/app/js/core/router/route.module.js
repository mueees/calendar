define([
    'app',
    'marionette',
    'core/security/security.module'
], function (App, Marionette, Security) {
    return App.module('Core.Components.Router', {
        define: function (Router) {
            Router.BaseRouter = Marionette.AppRouter.extend({
                before: function (route, name, access) {
                    if (access.auth && !Security.isAuth()) {
                        App.navigate('signin', {trigger: true});
                        return false;
                    }
                }
            });
        }
    });
});