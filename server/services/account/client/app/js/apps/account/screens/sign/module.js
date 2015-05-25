define([
    'app',
    'kernel/components/router/BaseRouter.router',
    'kernel/components/sign/sign.controller',
    './layout.view',

    'core/log/log.service',
    'core/window-title/window-title.service',
    'core/url/url.service',
    'core/notify/notify.service',
    'kernel/security/security.service'
], function (App, BaseRouter, SignupController, SignupLayout, $mLog, $mTitle, $mUrl, $mNotify, $mSecurity) {
    App.module('Apps.Account.Sign', {
        startWithParent: false,

        define: function (Sign, App, Backbone, Marionette, $, _) {
            var R = BaseRouter.extend({
                    appRoutes: {
                        '': 'redirect',
                        sign: 'sign'
                    },

                    access: {
                        sign: {
                            auth: false,
                            redirectIfAuth: {
                                fragment: 'dashboard/profile'
                            }
                        }
                    },

                    resolve: {
                        sign: [
                            {
                                name: 'resource1',
                                fn: function () {
                                    return {
                                        name: 'mue'
                                    };
                                }
                            },
                            {
                                name: 'resource2',
                                fn: function () {
                                    var def = $.Deferred();
                                    def.resolve({
                                        name: 'peter'
                                    });
                                    return def.promise();
                                }
                            }
                        ]
                    },

                    controller: {
                        sign: function (resolve) {
                            console.log(resolve.resource1);
                            console.log(resolve.resource2);

                            App.startSubApp("Apps.Account.Sign", {});
                        },

                        redirect: function () {
                            App.navigate('#sign', {trigger: true});
                        }
                    }
                }),
                controller,
                l = $mLog.getLogger('Sign');

            var Controller = Marionette.Controller.extend({
                initialize: function () {
                    var layout = new SignupLayout(),
                        signup = new SignupController({
                            region: layout.getRegion('signup')
                        });

                    App.body.show(layout);

                    signup.show();

                    this.listenTo(signup, 'signup', function () {
                        console.log('Done signup');
                    });

                    this.listenTo(signup, 'signin', function () {
                        var afterAuth = $mSecurity.getAfterAuth();

                        $mNotify.notify({
                            text: 'Signin success',
                            type: 'success'
                        });

                        if (afterAuth) {
                            App.navigate(afterAuth.fragment, {
                                trigger: true
                            });
                        }
                    });

                    $mTitle.setTitle('Sign');
                }
            });

            Sign.on('start', function () {
                App.body.reset();
                controller = new Controller();
                l.log("was started");
            });

            Sign.on('stop', function () {
                controller.destroy();
                App.body.reset();
                l.log("was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});