define([
    'marionette',
    './application.view'
], function (Marionette, ApplicationView) {
    return Marionette.CollectionView.extend({
        childView: ApplicationView,

        tagName: 'ul',

        className: 'list-group mue-application-list'
    });
});