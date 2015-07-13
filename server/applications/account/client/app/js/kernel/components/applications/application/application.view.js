define([
    'clientCore/components/base/view/form.view',
    'hbs',
    'text!./application.view.hbs',
    'clientCore/dialog/dialog.service'
], function (FormView, hbs, template, $mDialog) {
    return FormView.extend({
        template: hbs.compile(template),

        events: {
            "click [data-link='delete']": 'onDeleteHandler',
            "click [data-link='newPrivateKey']": 'newPrivateKeyHandler'
        },

        initialize: function () {
            FormView.prototype.initialize.apply(this, arguments);
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

        className: 'panel mue-panel mue-form-panel'
    });
});