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

            this.listenTo(this.view, 'cancel', this.onCancelHandler);
            this.listenTo(this.view, 'create', this.onCreateHandler);
        },

        onCancelHandler: function () {
            this.region.reset();
            this.trigger('cancel');
        },

        onCreateHandler: function () {
            this.region.reset();

            if (this.model.isValid(true)) {
                this.model.save();
            }

            this.trigger('create', this.model);
        },

        show: function () {
            this.region.show(this.view);
        }
    });
});