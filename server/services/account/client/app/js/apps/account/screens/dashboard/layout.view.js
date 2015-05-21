define([
    'marionette',
    'text!./layout.view.html'
], function (Marionette,  layoutTemplate) {
    return Marionette.LayoutView.extend({
        template: _.template(layoutTemplate),
        regions: {
            subController: '.mue-dashboard-subController-container',
            menu: '.mue-dashboard-menu-container'
        }
    })
});