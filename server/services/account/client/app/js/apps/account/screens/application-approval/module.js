define([
    'app',
    'kernel/components/router/BaseRouter.router',

    'core/log/log.service',
    'core/window-title/window-title.service',
    'core/url/url.service',
    'kernel/security/security.service'
], function (App, BaseRouter, $mLog, $mTitle, $mUrl, $mSecurity) {
    App.module('Apps.Account.Approval', {
        startWithParent: false,

        define: function (Approval, App, Backbone, Marionette, $, _) {
            var R = BaseRouter.extend({
                    appRoutes: {
                        approval: 'approval'
                    },

                    authError: function (route, name, access) {
                        $mSecurity.setAfterAuth({
                            fragment: 'approval',
                            query: {
                                applicationId: 'test'
                            }
                        });
                    },

                    access: {
                        approval: {
                            auth: true
                        }
                    },

                    resolve: {
                        approval: [
                            {
                                name: 'resource1',
                                fn: function () {
                                    return {
                                        name: 'mue'
                                    };
                                }
                            }
                        ]
                    },

                    controller: {
                        approval: function (resolve) {
                            App.startSubApp("Apps.Account.Approval", {});
                        }
                    }
                }),
                controller,
                l = $mLog.getLogger('Approval');

            var Controller = Marionette.Controller.extend({
                initialize: function () {
                    $mTitle.setTitle('Approval');
                }
            });

            Approval.on('start', function () {
                controller = new Controller();
                l.log("was started");
            });

            Approval.on('stop', function () {
                controller.destroy();
                l.log("was stopped");
            });

            App.addInitializer(function () {
                new R();
            });
        }
    });
});