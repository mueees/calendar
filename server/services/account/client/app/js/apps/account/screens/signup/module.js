define([
    'app',
    'core/router/route.module',
    'core/components/base/layout/layout.view',
    'text!./layout.view.html'
], function (App, Router, Layout, layoutTemplate) {
    App.module('Apps.Account.Signup', {
        startWithParent: false,

        define: function (Signup, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                    appRoutes: {
                        "": "signup",
                        "signup": "signup"
                    },

                    access: {
                        "signup": {
                            auth: false
                        }
                    },

                    controller: {
                        signup: function () {
                            App.startSubApp("Apps.Account.Signup", {});
                        }
                    }
                }),
                controller;

            var Controller = Marionette.Controller.extend({
                initialize: function () {
                    var layout = new Layout.BaseView({
                        template: _.template(layoutTemplate)
                    });

                    App.body.show(layout);
                }
            });

            Signup.on('start', function () {
                controller = new Controller();
                console.log("Signup was started");
            });

            Signup.on('stop', function () {
                controller.destroy();
                console.log("Signup was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});