define([
    'marionette',
    'hbs',
    'text!./no-items.view.hbs'
], function (Marionette, hbs, template) {
    return Marionette.ItemView.extend({
        template: hbs.compile(template)
    });
});