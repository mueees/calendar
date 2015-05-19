define([
    'app',
    'kernel/components/router/BaseRouter.router',
    'text!./layout.view.html',
    'kernel/components/sign/sign.controller'
], function (App, BaseRouter, layoutTemplate, SignupController) {
    App.module('Apps.Account.Sign', {
        startWithParent: false,

        define: function (Sign, App, Backbone, Marionette, $, _) {
            var R = BaseRouter.extend({
                    appRoutes: {
                        "": "redirect",
                        "sign": "sign"
                    },

                    access: {
                        "signup": {
                            auth: false
                        }
                    },

                    controller: {
                        sign: function () {
                            App.startSubApp("Apps.Account.Sign", {});
                        },

                        redirect: function () {
                            App.navigate('#sign', {trigger: true});
                        }
                    }
                }),
                controller;

            var Controller = Marionette.Controller.extend({
                initialize: function () {
                    var SignupLayout = Marionette.LayoutView.extend({
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
                        console.log('Done signup');
                    });

                    this.listenTo(signup, 'signin', function () {
                        console.log('Done signin');
                    });
                }
            });

            Sign.on('start', function () {
                controller = new Controller();
                console.log("Sign was started");
            });

            Sign.on('stop', function () {
                controller.destroy();
                console.log("Sign was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});