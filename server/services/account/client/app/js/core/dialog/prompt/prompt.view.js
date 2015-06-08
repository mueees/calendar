define([
    'marionette',
    'hbs',
    'text!./prompt.view.hbs'
], function (Marionette, hbs, template) {
    return Marionette.ItemView.extend({
        template: hbs.compile(template),

        className: 'modal-dialog'
    });
});