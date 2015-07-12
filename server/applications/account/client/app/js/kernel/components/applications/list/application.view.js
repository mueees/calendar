define([
    'marionette',
    'hbs',
    'text!./application.view.hbs',
    'clientCore/dialog/dialog.service'
], function (Marionette, hbs, template, $mDialog) {
    return Marionette.ItemView.extend({
        template: hbs.compile(template),

        tagName: 'li',

        className: 'list-group-item',

        events: {
            "click [data-link='toggleOpen']": 'onClickHandler',
            "click [data-link='delete']": 'onDeleteHandler',
            "click [data-link='newPrivateKey']": 'newPrivateKeyHandler'
        },

        ui: {
            privateKey: "[name='privateKey']"
        },

        initialize: function () {
            this.isOpen = false;

            this.listenTo(this.model, 'change:privateKey', this.privateKeyHandler);
            this.listenTo(this.model, 'change', this.anyChangeHandler);
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

        anyChangeHandler: function () {

        },

        newPrivateKeyHandler: function () {
            this.model.newPrivateKey();
        },

        onDeleteHandler: function () {
            var me = this;

            $mDialog.confirm({
                text: 'Do you want delete <strong>"' + this.model.get('name') + '"</strong> application ?',
                accept: 'Delete'
            }).then(function () {
                me.model.collection.remove(me.model);
                me.model.remove();
            });
        }
    });
});