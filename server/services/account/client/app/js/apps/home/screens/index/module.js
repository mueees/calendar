define([
    'app',
    'core/router/route.module',
    'core/components/menu/menu.module',
    'core/resource/base'
], function (App, Router, Menu, Resource) {
    App.module('Apps.Home.Index', {
        startWithParent: false,

        define: function (Index, App, Backbone, Marionette, $, _) {
            var R = Router.BaseRouter.extend({
                    appRoutes: {
                        "home": "home"
                    },

                    access: {
                        "home": {
                            auth: false
                        }
                    },

                    controller: {
                        home: function () {
                            App.startSubApp("Apps.Home.Index", {});
                        }
                    }
                }),
                menu;

            Index.on('start', function () {
                menu = new Menu.Base({
                    region: App.body,
                    model: new Resource.Base({
                        items: [
                            {
                                name: 'Home',
                                href: '#home'
                            },
                            {
                                name: 'Signin',
                                href: '#signin'
                            },
                            {
                                name: 'Test',
                                href: '#test'
                            }
                        ]
                    })
                });
                menu.show();
            });

            Index.on('stop', function () {
                App.body.reset();
                console.log("Home Index was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});