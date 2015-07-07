define([
    'backbone'
], function (Backbone) {
    return Backbone.Model.extend({
        idAttribute: '_id',

        headers: {"Content-Type": 'application/json'},

        initialize: function (options) {
            options = options || {};
            this.bind("error", this.defaultErrorHandler);
            Backbone.Model.prototype.initialize.apply(this, arguments);
        },

        defaultErrorHandler: function () {

        }
    });
});