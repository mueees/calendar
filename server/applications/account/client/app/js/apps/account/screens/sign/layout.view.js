define([
    'marionette',
    'hbs',
    'text!./layout.view.hbs'
], function (Marionette, hbs, layoutTemplate) {
    return Marionette.LayoutView.extend({
        template: hbs.compile(layoutTemplate),
        regions: {
            sign: '.sign-region'
        }
    })
});