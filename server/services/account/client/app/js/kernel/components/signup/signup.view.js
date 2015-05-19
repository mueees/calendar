define([
    'core/components/base/form/form.view',
    'text!./signup.view.html'
], function (FormView, template) {
    return FormView.extend({
        template: _.template(template),

        triggers: {
            "click .signup": "signup"
        },

        bindings: {
            '[name=email]': {
                observe: 'email'
            },
            '[name=password]': {
                observe: 'password'
            }
        }
    });
});