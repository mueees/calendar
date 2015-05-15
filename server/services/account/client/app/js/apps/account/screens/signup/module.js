define([
    'app',
    'core/router/route.module'
], function (App, Router) {
    App.module('Apps.Account.Signup', {
        startWithParent: false,

        define: function (Signup, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                    appRoutes: {
                        "": "signup",
                        "signup": "signup"
                    },

                    access: {
                        "home": {
                            auth: false
                        }
                    },

                    controller: {
                        signup: function () {
                            App.startSubApp("Apps.Account.Signup", {});
                        }
                    }
                });

            Signup.on('start', function () {
                console.log("Signup was stopped");
            });

            Signup.on('stop', function () {
                console.log("Signup was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});