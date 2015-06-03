define([
    'marionette',
    'hbs',
    'text!./application.view.hbs'
], function (Marionette, hbs, template) {
    return Marionette.ItemView.extend({
        template: hbs.compile(template),

        tagName: 'li',

        className: 'list-group-item',

        events: {
            "click [data-link='toggleOpen']": 'onClickHandler'
        },

        initialize: function () {
            this.isOpen = false;
        },

        onClickHandler: function () {
            this.isOpen = !this.isOpen;
            this.toggleOpen();
        },

        toggleOpen: function () {
            if (this.isOpen) {
                this.$el.addClass('mue-application-item-open');
            } else {
                this.$el.removeClass('mue-application-item-open');
            }
        }
    });
});