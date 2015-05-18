define([
    'app',
    'core/router/route.module'
], function (App, Router) {
    App.module('Apps.Account.Profile', {
        startWithParent: false,

        define: function (Profile, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                    appRoutes: {
                        "profile": "profile"
                    },

                    access: {
                        "profile": {
                            auth: true
                        }
                    },

                    controller: {
                        profile: function () {
                            App.startSubApp("Apps.Account.Profile", {});
                        }
                    }
                });

            Profile.on('start', function () {
                console.log("Profile was started");
            });

            Profile.on('stop', function () {
                console.log("Profile was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});