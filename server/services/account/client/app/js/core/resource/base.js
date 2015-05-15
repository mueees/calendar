define([
    'app',
    'backbone'
], function (App, Backbone) {
    return App.module('Core.Resource', {
        define: function (Resource) {
            Resource.Base = Backbone.Model.extend({
                initialize: function (options) {
                    options || (options = {});
                    this.bind("error", this.defaultErrorHandler);
                    Backbone.Model.prototype.initialize.apply(this, arguments);
                },

                defaultErrorHandler: function () {}
            });
        }
    });
});