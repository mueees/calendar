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
        },

        show: function () {
            this.region.show(this.view);
        }
    });
});