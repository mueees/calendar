define([
    'marionette',
    'text!./list-group.view.html'
], function (Marionette, template) {
    return Marionette.ItemView.extend({
        template: _.template(template)
    });
});