define([
    'marionette',
    './application-approval.view',
    'kernel/resource/commands/application',
    'core/notify/notify.service'
], function (Marionette, View, Commands, $mNotify) {
    return Marionette.Controller.extend({
        initialize: function (options) {
            this.options = options;
            this.application = options.application;
            this.region = options.region;

            this.view = new View({
                model: this.application
            });
        },

        show: function () {
            this.region.show(this.view);

            this.listenTo(this.view, 'cancel', this.onCancelHandler);
            this.listenTo(this.view, 'approve', this.onApprovalHandler);
        },

        onCancelHandler: function () {
            this.trigger('cancel');
        },

        onApprovalHandler: function () {
            var command = Commands.get('application:approve'),
                me = this;

            command.execute({
                applicationid: this.application.get('_id')
            }).then(function (data) {
                $mNotify.notify({
                    text: me.application.get('name') + ' get access'
                });

                setTimeout(function () {
                    me.trigger('approve', data);
                }, 700);
            });
        }
    });
});