define([
    'marionette',
    './layout.view',

    'kernel/components/applications/list/list.controller',
    'kernel/components/applications/new/new.controller'
], function (Marionette, Layout, ApplicationList, NewApplication) {
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
            this.applicationList = new ApplicationList({
                region: this.layout.getRegion('content')
            });

            this.applicationList.show();
        },

        onNewHandler: function () {
            var newApplication = new NewApplication({
                region: this.layout.getRegion('newApplication')
            });

            newApplication.show();

            this.listenTo(newApplication, 'create', this.onNewApplicationHandler);
        },

        onNewApplicationHandler: function (application) {
            this.applicationList.addApplication(application);
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