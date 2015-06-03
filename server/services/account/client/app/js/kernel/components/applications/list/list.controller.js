define([
    'marionette',
    './list.view',

    'kernel/resource/application.collection'
], function (Marionette, View, ApplicationCollection) {
    return Marionette.Controller.extend({
        initialize: function (options) {
            this.options = options || {};
            this.region = options.region;

            this.applicationCollection = new ApplicationCollection();

            this.applicationCollection.fetch();

            this.view = new View({
                collection: this.applicationCollection
            });
        },

        show: function () {
            this.region.show(this.view);
        }
    });
});