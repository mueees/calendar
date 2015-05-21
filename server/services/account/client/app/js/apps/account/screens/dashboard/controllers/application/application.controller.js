define([
    'marionette'
], function (Marionette) {
    return Marionette.Object.extend({
        initialize: function () {
            Marionette.Object.prototype.initialize(this, arguments);
        }
    })
});