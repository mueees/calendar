define([
    'marionette',
    './application.view',
    'core/components/base/no-items/no-items.view'
], function (Marionette, ApplicationView, NoItemsView) {
    return Marionette.CollectionView.extend({
        childView: ApplicationView,

        tagName: 'ul',

        className: 'list-group mue-application-list',

        emptyView: NoItemsView
    });
});