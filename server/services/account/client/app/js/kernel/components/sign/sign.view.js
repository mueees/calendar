define([
    'core/components/base/view/form.view',
    'text!./sign.view.html'
], function (FormView, template) {
    return FormView.extend({
        template: _.template(template),

        triggers: {
            "click .signup": "signup",
            "click .signin": "signin"
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