define([
    'marionette',
    './layout.view',

    'kernel/components/applications/list/list.controller'
], function (Marionette, Layout, ApplicationList) {
    return Marionette.Object.extend({
        initialize: function (options) {
            Marionette.Object.prototype.initialize(this, arguments);

            this.options = options;
            this.region = options.region;
            this.layout = new Layout();

            this.listenTo(this.layout, 'list', this.onListHandler);
            this.listenTo(this.layout, 'new', this.onNewHandler);
        },

        onListHandler: function () {
            var region = this.layout.getRegion('content'),
                applicationList = new ApplicationList({
                    region: region
                });

            applicationList.show();
        },

        onNewHandler: function () {
            this.region.reset();
        },

        show: function () {
            this.region.show(this.layout);
            this.onListHandler();
        },

        onDestroy: function () {
            this.region.reset();
        }
    })
});