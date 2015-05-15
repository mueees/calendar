define([
    'app',
    'core/router/route.module',
    'core/components/base/layout/layout.view',
    'text!./layout.view.html'
], function (App, Router, Layout, template) {
    App.module('Apps.Home.Test', {
        startWithParent: false,

        define: function (Test, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                appRoutes: {
                    'test': 'test'
                },

                access: {
                    "test": {
                        auth: false
                    }
                },

                controller: {
                    test: function () {
                        App.startSubApp("Apps.Home.Test", {});
                    }
                }
            });

            Test.on('start', function () {
                App.body.show(new Layout.BaseView({
                    template: _.template(template)
                }));

                console.log("Home Test was started");
            });

            Test.on('stop', function () {
                App.body.reset();
                console.log("Home Test was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});