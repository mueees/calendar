define([
    'marionette',
    'text!./menu.view.html'
], function (Marionette, template) {
    return Marionette.ItemView.extend({
        template: _.template(template)
    });
});