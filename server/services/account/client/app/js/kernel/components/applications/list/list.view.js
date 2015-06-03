define([
    'marionette',
    'text!./list.view.html',

    './application.view'
], function (Marionette, template, ApplicationView) {
    return Marionette.CollectionView.extend({
        childView: ApplicationView,

        tagName: 'ul',

        className: 'list-group mue-application-list'
    });
});