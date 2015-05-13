define([
    'app',
    'core/router/route.module'
], function (App, Router) {
    App.module('Apps.Home.Signin', {
        startWithParent: true,

        define: function (Index, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                before: function () {
                    if(Router.BaseRouter.prototype.before.apply(this, arguments)){
                        App.startSubApp("Apps.Home.Signin", {});
                    }
                },

                appRoutes: {
                    'signin': 'signin'
                },

                onRoute: function () {
                    console.log('onRoute signin');
                }
            });

            App.addInitializer(function () {
                new R({
                    controller: {
                        signin: function () {
                            console.log('This is signin');
                        }
                    }
                });
            });
        }
    });
});