define([
    'marionette',
    'core/resource/base',
    'kernel/security/security.service',
    './sign.view'
], function (Marionette, BaseModel, $mSecurity, View) {
    var Model = BaseModel.extend({
        validation: {
            email: {
                required: true,
                pattern: 'email'
            },
            password: {
                required: true,
                minLength: 5
            }
        }
    });

    return Marionette.Controller.extend({
        initialize: function (options) {
            this.options = options || {};
            this.region = options.region;
            this.model = new Model();

            this.view = new View({
                model: this.model
            });

            this.listenTo(this.view, 'signup', this.signUpHandler);
            this.listenTo(this.view, 'signin', this.signInHandler);
        },

        show: function () {
            this.region.show(this.view);
        },

        signUpHandler: function () {
            if (this.model.isValid(true)) {
                $mSecurity.signup({
                    email: this.model.get('email'),
                    password: this.model.get('password')
                });
            }
        },

        signInHandler: function () {
            if (this.model.isValid(true)) {
                $mSecurity.signin({
                    email: this.model.get('email'),
                    password: this.model.get('password')
                });
            }
        }
    });
});