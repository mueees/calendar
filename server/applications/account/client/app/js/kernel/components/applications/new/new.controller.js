define([
    'marionette',
    './new.view',

    'kernel/resource/application.model'
], function (Marionette, View, ApplicationModel) {
    return Marionette.Controller.extend({
        initialize: function (options) {
            this.options = options || {};
            this.region = options.region;

            this.application = new ApplicationModel();

            this.view = new View({
                model: this.application
            });

            this.listenTo(this.view, 'create', this.onCreateHandler);
        },

        onCreateHandler: function () {
            var me = this;

            if (this.application.isValid(true)) {
                this.application.create().then(function () {
                    me.trigger('create', me.application);
                    me.region.reset();
                });
            }
        },

        show: function () {
            this.region.show(this.view);
        }
    });
});