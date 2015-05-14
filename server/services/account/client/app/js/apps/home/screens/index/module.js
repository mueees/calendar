define([
    'app',
    'core/router/route.module',
    'core/components/base/layout.view'
], function (App, Router) {
    App.module('Apps.Home.Index', {
        startWithParent: false,

        define: function (Index, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                    appRoutes: {
                        "home": "home"
                    },

                    access: {
                        "home": {
                            auth: true
                        }
                    },

                    controller: {
                        home: function () {
                            App.startSubApp("Apps.Home.Index", {});
                        }
                    }
                }),
                Controller = Marionette.Controller.extend({
                    initialize: function () {
                        new Marionette.Base.View.Layout({
                            template: ''
                        });
                    }
                }),
                controller;

            Index.on('start', function () {
                console.log("Home Index was started");
                controller = new Controller();
            });

            Index.on('stop', function () {
                console.log("Home Index was stopped");
                controller.remove();
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});