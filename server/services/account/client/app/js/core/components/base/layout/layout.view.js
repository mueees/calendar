define([
    'app',
    'marionette'
], function (App, Marionette) {
    return App.module('Core.Components.Base.Layout', {
        define: function (Layout) {
            Layout.BaseView = Marionette.ItemView.extend({
                initialize: function (options) {
                    this.options = options;
                    this.region = this.options.region;
                },

                show: function () {
                    this.region.show(this.view);
                }
            });
        }
    });
});