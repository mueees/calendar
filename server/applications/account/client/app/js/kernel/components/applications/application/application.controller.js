define([
    'marionette',
    './application.view'
], function (Marionette, View) {
    return Marionette.Controller.extend({
        initialize: function (options) {
            this.options = options || {};
            this.region = options.region;

            this.view = new View({
                model: options.application
            });
        },

        show: function () {
            this.region.show(this.view);
        }
    });
});