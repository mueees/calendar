define([
    'app',
    'kernel/components/router/BaseRouter.router',

    // main layout
    './layout.view',

    //controllers
    './controllers/application/application.controller',
    './controllers/proflie/profile.controller',

    // components
    'core/components/menu/menu.view'
], function (App, BaseRouter, DashboardLayout, ApplicationController, ProfileController, MenuView) {
    App.module('Apps.Account.Dashboard', {
        startWithParent: false,

        define: function (Dashboard, App, Backbone, Marionette, $, _) {
            var R = BaseRouter.extend({
                    appRoutes: {
                        'dashboard': 'redirect',
                        "dashboard/profile": "profile",
                        "dashboard/application": "application"
                    },

                    access: {
                        "profile": {
                            auth: false
                        },
                        "profile/application": {
                            auth: false
                        }
                    },

                    controller: {
                        redirect: function () {
                            App.navigate('#dashboard/profile', {trigger: true});
                        },

                        profile: function () {
                            App.startSubApp("Apps.Account.Dashboard", {});
                            controller.profile();
                        },

                        application: function () {
                            App.startSubApp("Apps.Account.Dashboard", {});
                            controller.application();
                        }
                    }
                }),
                controller;

            var Controller = Marionette.Object.extend({
                initialize: function () {
                    Marionette.Object.prototype.initialize();
                    this.layout = new DashboardLayout();
                    App.body.show(this.layout);

                    this.menu = new MenuView({
                        model: new Backbone.Model({
                            items: [
                                {
                                    name: 'profile',
                                    href: 'dashboard/profile'
                                },
                                {
                                    name: 'application',
                                    href: 'dashboard/application'
                                }
                            ]
                        })
                    });

                    this.layout.menu.show(this.menu);
                },

                profile: function () {
                    this.closeSubController();
                    this.subController = new ProfileController({
                        region: this.layout.subController
                    });
                    console.log('profile was started');
                },

                application: function () {
                    this.closeSubController();
                    this.subController = new ApplicationController({
                        region: this.layout.subController
                    });
                    console.log('application was started');
                },

                closeSubController: function () {
                    if (this.subController) {
                        this.subController.destroy();
                    }
                }
            });

            Dashboard.on('start', function () {
                controller = new Controller();
                console.log("Dashboard was started");
            });

            Dashboard.on('stop', function () {
                controller.destroy();
                console.log("Dashboard was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});