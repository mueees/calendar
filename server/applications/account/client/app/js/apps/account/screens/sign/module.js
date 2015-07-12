define([
    'app',
    'kernel/components/router/BaseRouter.router',
    'kernel/components/sign/sign.controller',
    './layout.view',

    'core/log/log.service',
    'core/window-title/window-title.service',
    'core/url/url.service',
    'core/notify/notify.service',
    'core/channel/channel.service'
], function (App, BaseRouter, SignController, SignLayout, $mLog, $mTitle, $mUrl, $mNotify, $mChannel) {
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

                    controller: {
                        sign: function (resolve) {
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
                    var layout = new SignLayout(),
                        sign = new SignController({
                            region: layout.getRegion('sign')
                        });

                    App.body.show(layout);
                    sign.show();

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