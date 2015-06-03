define([
    'backbone'
], function (Backbone) {
    return Backbone.Model.extend({
        idAttribute: '_id',

        initialize: function (options) {
            options = options || {};
            this.bind("error", this.defaultErrorHandler);
            Backbone.Model.prototype.initialize.apply(this, arguments);
        },

        defaultErrorHandler: function () {

        }
    });
});