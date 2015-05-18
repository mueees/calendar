define([
    'app',
    './base'
], function (App) {
    return App.module('Core.Resource', {
        define: function (Resource) {
            Resource.User = Resource.Base.extend({
                initialize: function (options) {
                    Resource.Base.prototype.initialize(this, arguments);

                }
            });

            Resource.User.login = function (credentials) {
                return App.AjaxCommands.login(credentials);
            };

            Resource.User.logout = function () {
                return App.AjaxCommands.logout();
            };
        }
    });
});