define([
    'marionette',
    'hbs',
    'text!./new.view.hbs'
], function (Marionette, hbs, template) {
    return Marionette.ItemView.extend({
        template: hbs.compile(template),

        className: 'panel panel-default'
    });
});