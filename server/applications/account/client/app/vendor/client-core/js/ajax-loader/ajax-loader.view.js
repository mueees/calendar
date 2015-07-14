define([
    'marionette',
    'text!./ajax-loader.view.html'
], function (Marionette, template) {
    return Marionette.ItemView.extend({
        className: 'mue-spinner',
        template: _.template(template)
    });
});