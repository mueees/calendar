define([
    'marionette',
    'hbs',
    'text!./layout.view.hbs'
], function (Marionette, hbs, layoutTemplate) {
    return Marionette.LayoutView.extend({
        template: hbs.compile(layoutTemplate),

        regions: {
            applicationList: "[data-region='applicationList']",
            application: "[data-region='application']"
        }
    })
});