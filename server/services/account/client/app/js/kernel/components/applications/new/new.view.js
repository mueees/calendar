define([
    'core/components/base/view/form.view',
    'hbs',
    'text!./new.view.hbs'
], function (FormView, hbs, template) {
    return FormView.extend({
        template: hbs.compile(template),

        triggers: {
            "click [data-link='cancel']": 'cancel',
            "click [data-link='create']": 'create'
        },

        bindings: {
            '[name=name]': {
                observe: 'name'
            },
            '[name=description]': {
                observe: 'description'
            },
            '[name=redirectUrl]': {
                observe: 'redirectUrl'
            }
        },

        className: 'panel panel-default'
    });
});