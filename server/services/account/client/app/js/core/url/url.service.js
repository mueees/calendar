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

    return {
        getUrlWithoutHash: getUrlWithoutHash,
        getTotal: getTotal
    }
});