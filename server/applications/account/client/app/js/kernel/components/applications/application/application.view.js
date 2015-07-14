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
            "click [data-link='update']": 'onEditHandler',
            "click [data-link='newPrivateKey']": 'newPrivateKeyHandler'
        },

        ui: {
            titleForm: ".form-panel-title",
            descriptionForm: ".form-panel-description",
            domain: "[name='domain']",
            name: "[name='name']",
            description: "[name='description']",
            privateKey: "[name='privateKey']",
            updateBtn: "[data-link='update']"
        },

        bindings: {
            '[name=name]': {
                observe: 'name'
            },
            '[name=domain]': {
                observe: 'domain'
            },
            '[name=description]': {
                observe: 'description'
            }
        },

        initialize: function () {
            FormView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:privateKey', this.privateKeyHandler);
            this.listenTo(this.model, 'change:domain change:name change:description', this.onChangeUpdateHandler);
        },

        onChangeUpdateHandler: function () {
            this.ui.updateBtn.attr('disabled', false);

            var description = this.model.get('description'),
                name = this.model.get('name');

            this.ui.domain.val();
            this.model.get('domain');
            this.ui.name.val(name);
            this.ui.description.val(description);

            this.ui.titleForm.html(name);
            this.ui.descriptionForm.html(description)
        },

        onEditHandler: function (e) {
            e.preventDefault();

            var me = this;

            this.model.editData({
                domain: this.model.get('domain'),
                name: this.model.get('name'),
                description: this.model.get('description')
            }).then(function () {
                me.ui.updateBtn.attr('disabled', true);
            });
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

        privateKeyHandler: function () {
            this.ui.privateKey.val(this.model.get('privateKey'));
        }
    });
});