define([
    'marionette',
    './layout.view',

    'kernel/components/applications/application-list/application-list.view',
    'kernel/resource/application.collection',
    'kernel/components/applications/new/new.controller',
    'kernel/components/applications/application/application.controller'
], function (Marionette, Layout, ApplicationListView, ApplicationCollection, NewApplication, Application) {
    return Marionette.Object.extend({
        initialize: function (options) {
            Marionette.Object.prototype.initialize(this, arguments);

            this.options = options;
            this.region = options.region;
            this.layout = new Layout();

            this.applications = new ApplicationCollection();

            this.applications.fetch();

            this.applicationListView = new ApplicationListView({
                collection: this.applications
            });

            this.listenTo(this.applicationListView, 'application:new', this.onNewApplicationHandler);
            this.listenTo(this.applicationListView, 'application:selected', this.onApplicationSelectedHandler);
        },

        onApplicationSelectedHandler: function(id){
            var application = new Application({
                    region: this.layout.getRegion('application'),
                    application: this.applications.get(id)
                });

            application.show();
        },

        onNewApplicationHandler: function () {
            var newApplication = new NewApplication({
                region: this.layout.getRegion('application')
            }),
                me = this;

            newApplication.show();

            this.listenTo(newApplication, 'create', function(application){
                me.applications.add(application);
            });
        },

        show: function () {
            this.region.show(this.layout);
            this.layout.getRegion('applicationList').show(this.applicationListView);
            this.onNewApplicationHandler();
        },

        onDestroy: function () {
            this.region.reset();
        }
    })
});