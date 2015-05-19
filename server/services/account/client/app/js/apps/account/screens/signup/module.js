define([
    'app',
    'kernel/components/router/BaseRouter.router',
    'core/components/base/layout/layout.view',
    'text!./layout.view.html',
    'kernel/components/signup/signup.controller'
], function (App, BaseRouter, Layout, layoutTemplate, SignupController) {
    App.module('Apps.Account.Signup', {
        startWithParent: false,

        define: function (Signup, App, Backbone, Marionette, $, _) {
            var R = BaseRouter.extend({
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
                    var SignupLayout = Layout.extend({
                            template: _.template(layoutTemplate),
                            regions: {
                                signup: '.signup'
                            }
                        }),
                        layout = new SignupLayout(),
                        signup = new SignupController({
                            region: layout.getRegion('signup')
                        });

                    App.body.show(layout);
                    signup.show();

                    this.listenTo(signup, 'signup', function () {
                        console.log('Done');
                    });
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