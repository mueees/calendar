define([
    'clientCore/components/base/view/form.view',
    'hbs',
    'text!./new.view.hbs'
], function (FormView, hbs, template) {
    return FormView.extend({
        template: hbs.compile(template),

        ui: {
            redirectGroup: '.redirectUrl-group'
        },

        initialize: function () {
            FormView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:useProxy', this.onChangeProxy);
        },

        onChangeProxy: function () {
            this.ui.redirectGroup.toggleClass('hide')
        },

        triggers: {
            "click [data-link='cancel']": 'cancel',
            "click [data-link='create']": 'create'
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
            },
            '[name=redirectUrl]': {
                observe: 'redirectUrl'
            },
            '[name=useProxy]': {
                observe: 'useProxy'
            }
        },

        className: 'panel panel-default'
    });
});