define([
    'app',
    'core/router/route.module'
], function (App, Router) {
    App.module('Apps.Home.Signin', {
        startWithParent: false,

        define: function (Signin, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                appRoutes: {
                    'signin': 'signin'
                },

                access: {
                    "home": {
                        auth: false
                    }
                },

                controller: {
                    signin: function () {
                        App.startSubApp("Apps.Home.Signin", {});
                    }
                }
            });

            Signin.on('start', function () {
                console.log("Home Signin was started");
            });

            Signin.on('stop', function () {
                App.body.reset();
                console.log("Home Signin was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});