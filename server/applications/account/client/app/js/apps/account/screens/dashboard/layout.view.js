define([
    'marionette',
    'hbs',
    'text!./layout.view.hbs'
], function (Marionette, hbs, layoutTemplate) {
    return Marionette.LayoutView.extend({
        template: hbs.compile(layoutTemplate),

        triggers: {
            "click [data-link='logout']": 'logout'
        },

        regions: {
            subController: '.mue-dashboard-subController-container'
        }
    })
});