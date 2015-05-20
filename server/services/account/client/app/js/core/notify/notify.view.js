define([
    'marionette',
    'text!./notify.view.html'
], function (Marionette, template) {
    return Marionette.ItemView.extend({
        template: _.template(template),

        events: {
            'click': 'onClick'
        },

        initialize: function (options) {
            this.options = options || {};
            this.render();
        },

        onClick: function () {
            this.remove();
        }
    });
});