define([
    'app',
    'kernel/components/router/BaseRouter.router',
    './layout.view',

    'clientCore/log/log.service',
    'clientCore/window-title/window-title.service',
    'core/url/url.service',
    'kernel/security/security.service',
    'kernel/resource/application.model',
    'kernel/components/application-approval/application-approval.controller'
], function (App, BaseRouter, ApprovalLayout, $mLog, $mTitle, $mUrl, $mSecurity, ApplicationModel, ApplicationApprovalController) {
    App.module('Apps.Account.Approval', {
        startWithParent: false,

        define: function (Approval, App, Backbone, Marionette, $, _) {
            var R = BaseRouter.extend({
                    appRoutes: {
                        approval: 'approval'
                    },

                    authError: function (route, name, access) {
                        var total = $mUrl.getTotal();

                        $mSecurity.setAfterAuth({
                            fragment: 'approval',
                            query: total.query
                        });
                    },

                    resolveError: {},

                    access: {
                        approval: {
                            auth: true
                        }
                    },

                    resolve: {
                        approval: [
                            {
                                name: 'application',
                                fn: function () {
                                    var def = $.Deferred(),
                                        application = new ApplicationModel({
                                            applicationId: $mUrl.getTotal().query.applicationid
                                        });

                                    application.fetchByApplicationId().then(function () {
                                        def.resolve(application);
                                    }, function () {
                                        def.reject();
                                    });

                                    return def.promise();
                                }
                            }
                        ]
                    },

                    controller: {
                        approval: function (resolve) {
                            App.startSubApp("Apps.Account.Approval", {
                                resolve: resolve
                            });
                        }
                    }
                }),
                controller,
                l = $mLog.getLogger('Approval');

            var Controller = Marionette.Controller.extend({
                initialize: function (options) {
                    var layout = new ApprovalLayout(),
                        approval = new ApplicationApprovalController({
                            application: options.resolve.application,
                            region: layout.getRegion('approval')
                        });

                    App.body.show(layout);
                    approval.show();

                    this.listenTo(approval, 'approve', function (data) {
                        window.location.href = data.redirectUrl;
                    });
                    this.listenTo(approval, 'cancel', function () {
                        window.open($mUrl.getTotal().query.redirect);
                        $mSecurity.navigateAfterSign();
                    });

                    $mTitle.setTitle('Approval: ' + options.resolve.application.get('name'));
                }
            });

            Approval.on('start', function (arg) {
                controller = new Controller(arg);
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