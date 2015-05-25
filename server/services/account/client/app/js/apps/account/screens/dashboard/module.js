define([
    'app',
    'kernel/components/router/BaseRouter.router',

    // main layout
    './layout.view',

    //controllers
    './controllers/application/application.controller',
    './controllers/proflie/profile.controller',

    // components
    'core/components/menu/menu.view',
    'core/log/log.service',
    'core/window-title/window-title.service',
    'kernel/security/auth.service'
], function (App, BaseRouter, DashboardLayout, ApplicationController, ProfileController, MenuView, $mLog ,$mTitle, $mAuth) {
    App.module('Apps.Account.Dashboard', {
        startWithParent: false,

        define: function (Dashboard, App, Backbone, Marionette, $, _) {
            var R = BaseRouter.extend({
                    appRoutes: {
                        'dashboard': 'redirect',
                        'dashboard/profile': 'profile',
                        'dashboard/application': 'application'
                    },

                    access: {
                        profile: {
                            auth: true
                        },
                        'profile/application': {
                            auth: true
                        }
                    },

                    controller: {
                        redirect: function () {
                            App.navigate('#dashboard/profile', {trigger: true});
                        },

                        profile: function () {
                            App.startSubApp('Apps.Account.Dashboard', {});
                            controller.profile();
                        },

                        application: function () {
                            App.startSubApp('Apps.Account.Dashboard', {});
                            controller.application();
                        }
                    }
                }),
                controller,
                l = $mLog.getLogger('Dashboard');

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

                    this.listenTo(this.layout, 'logout', this.logoutHandler);
                },

                profile: function () {
                    this.closeSubController();
                    this.subController = new ProfileController({
                        region: this.layout.subController
                    });
                    $mTitle.setTitle('Dashboard: profile');
                    l.log('profile was started');
                },

                application: function () {
                    this.closeSubController();
                    this.subController = new ApplicationController({
                        region: this.layout.subController
                    });
                    $mTitle.setTitle('Dashboard: application');
                    l.log('application was started');
                },

                closeSubController: function () {
                    if (this.subController) {
                        this.subController.destroy();
                    }
                },

                logoutHandler: function (e) {
                    $mSecurity.logout();
                    $mAuth.logout();
                }
            });

            Dashboard.on('start', function () {
                controller = new Controller();
                l.log('was started');
            });

            Dashboard.on('stop', function () {
                controller.destroy();
                l.log('was stopped');
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});