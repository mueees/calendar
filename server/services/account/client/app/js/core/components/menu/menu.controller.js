define([
    'marionette',
    'text!./menu.view.html'
], function (Marionette, template) {
    var View = Marionette.ItemView.extend({
        template: _.template(template)
    });

    return Marionette.Controller.extend({
        initialize: function (options) {
            this.options = options;
            this.region = this.options.region;
            this.model = this.options.model;
            this.view = new View({
                model: this.model
            });
        },

        show: function () {
            this.region.show(this.view);
        }
    });
});