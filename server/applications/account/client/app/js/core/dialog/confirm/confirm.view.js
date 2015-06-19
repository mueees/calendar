define([
    'marionette',
    'hbs',
    'text!./confirm.view.hbs'
], function (Marionette, hbs, template) {
    return Marionette.ItemView.extend({
        template: hbs.compile(template),

        className: 'modal-dialog',

        triggers: {
            "click [data-link='decline']": 'decline',
            "click [data-link='accept']": 'accept'
        }
    });
});