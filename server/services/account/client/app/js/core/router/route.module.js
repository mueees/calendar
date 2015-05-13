define([
    'app',
    'marionette',
    'core/security/security.module'
], function (App, Marionette, Security) {
    return App.module('Core.Router', {
        define: function (Router) {
            Router.BaseRouter = Marionette.AppRouter.extend({
                before: function () {
                    Marionette.AppRouter.prototype.before.apply(this, arguments);

                    if (!Security.isAuth()) {
                        App.navigate('signin', {trigger: true});
                    }
                }
            });
        }
    });
});