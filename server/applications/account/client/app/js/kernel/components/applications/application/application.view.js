define([
    'clientCore/components/base/view/form.view',
    'hbs',
    'text!./application.view.hbs',
    'clientCore/dialog/dialog.service'
], function (FormView, hbs, template, $mDialog) {
    return FormView.extend({
        template: hbs.compile(template),

        className: 'panel mue-panel mue-form-panel',

        events: {
            "click [data-link='delete']": 'onDeleteHandler',
            "click [data-link='newPrivateKey']": 'newPrivateKeyHandler'
        },

        ui: {
            privateKey: "[name='privateKey']"
        },

        initialize: function () {
            FormView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:privateKey', this.privateKeyHandler);
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
        },

        newPrivateKeyHandler: function () {
            var me = this;

            $mDialog.confirm({
                text: 'Do you want update private key?',
                accept: 'Update'
            }).then(function () {
                me.model.newPrivateKey();
            });
        },

        privateKeyHandler: function(){
            this.ui.privateKey.val(this.model.get('privateKey'));
        }
    });
});