define([
    'marionette',
    'hbs',
    'text!./application-approval.view.hbs'
], function (Marionette, hbs, template) {
    return Marionette.ItemView.extend({
        template: hbs.compile(template),

        triggers: {
            "click [data-link='cancel']": "cancel",
            "click [data-link='approve']": "approve"
        }
    });
});