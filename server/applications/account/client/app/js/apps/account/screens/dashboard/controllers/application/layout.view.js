define([
    'marionette',
    'hbs',
    'text!./layout.view.hbs'
], function (Marionette, hbs, layoutTemplate) {
    return Marionette.LayoutView.extend({
        template: hbs.compile(layoutTemplate),

        triggers: {
            "click [data-link='list']": "list",
            "click [data-link='new']": "new"
        },

        regions: {
            content: "[data-region='content']",
            newApplication: "[data-region='newApplication']"
        }
    })
});