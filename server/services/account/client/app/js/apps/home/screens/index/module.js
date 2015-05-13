define([
    'app',
    'core/router/route.module'
], function (App, Router) {
    App.module('Apps.Home.Index', {
        startWithParent: true,

        define: function (Index, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                before: function () {
                    if(Router.BaseRouter.prototype.before.apply(this, arguments)){
                        App.startSubApp("Apps.Home.Signin", {});
                    }
                },

                appRoutes: {
                    "home": "home"
                },

                onRoute: function () {
                    console.log('onRoute home');
                }
            });

            App.addInitializer(function () {
                new R({
                    controller: {
                        home: function () {
                            console.log('This is home');
                        }
                    }
                });
            });
        }
    });
});