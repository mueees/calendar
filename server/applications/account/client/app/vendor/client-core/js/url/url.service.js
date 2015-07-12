define([
    'backbone',
    'marionette'
], function (Backbone, Marionette) {
    var router = new Marionette.AppRouter();

    function getTotal() {
        return Backbone.history.getTotal();
    }

    function getUrlWithoutHash() {
        return window.location.origin + window.location.pathname;
    }

    function toFragment(route, queryParameters) {
        return router.toFragment(route, queryParameters);
    }

    return {
        getUrlWithoutHash: getUrlWithoutHash,
        getTotal: getTotal,
        toFragment: toFragment
    }
});