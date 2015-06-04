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
            "click [data-link='toggleOpen']": 'onClickHandler',
            "click [data-link='newPrivateKey']": 'newPrivateKeyHandler'
        },

        ui: {
            privateKey: "[name='privateKey']"
        },

        initialize: function () {
            this.isOpen = false;

            this.listenTo(this.model, 'change:privateKey', this.privateKeyHandler)
        },

        privateKeyHandler: function () {
            this.ui.privateKey.val(this.model.get('privateKey'));
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
        },

        newPrivateKeyHandler: function () {
            this.model.newPrivateKey()
        }
    });
});