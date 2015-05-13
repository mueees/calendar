define([
    'marionette'
], function (Marionette) {
    var App = new Marionette.Application();
    var AppRouter = Marionette.AppRouter.extend({});
    App.router = new AppRouter();
    App.router.root = '/';

    App.on('start', function () {
        if (Backbone.history) {
            Backbone.history.start();
        }
    });

    App.navigate = function (fragment, options) {
        options = options || {};
        App.router.navigate(fragment, options);
    };

    App.redirect = function (url) {
        window.location.href = url;
    };

    App.reload = function () {
        window.location.reload();
    };

    App.reloadCurrentApp = function () {
        Backbone.history.loadUrl(Backbone.history.fragment);
    };

    App.startSubApp = function (appName, args) {
        var currentApp = App.module(appName);
        if (App.currentApp === currentApp) {
            return;
        }

        $('body').removeClass().addClass(currentApp.moduleName.toLowerCase());

        if (App.currentApp) {
            App.currentApp.stop();
        }

        App.currentApp = currentApp;
        currentApp.start(args);
    };

    App.addRegions({
        body: "body"
    });

    return App;
});