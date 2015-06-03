define([
    'marionette'
], function (Marionette) {
    return Marionette.Object.extend({
        initialize: function (options) {
            Marionette.Object.prototype.initialize(this, arguments);

            this.options = options;
            this.region = options.region;
        },

        show: function () {
            /*this.region.show(this.layout);*/
        },

        onDestroy: function () {
            this.region.reset();
        }
    })
});