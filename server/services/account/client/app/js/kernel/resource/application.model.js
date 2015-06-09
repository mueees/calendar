define([
    'core/resource/base.model',
    'config/app'
], function (BaseModel, config) {
    var Application = BaseModel.extend({
        urlRoot: '/api/v' + config.api.version + '/application/create',

        urls: {
            privateKey: '/api/v' + config.api.version + '/application/privateKey',
            remove: '/api/v' + config.api.version + '/application/remove'
        },

        defaults: {
            name: '',
            domain: '',
            description: '',
            redirectUrl: ''
        },

        validation: {
            name: {
                required: true
            },
            redirectUrl: {
                required: true
            },
            domain: {
                required: true
            }
        },

        newPrivateKey: function () {
            var data = {
                    _id: this.get('_id')
                },
                defaults = {
                    url: this.urls.privateKey,
                    type: 'POST',
                    data: JSON.stringify(data)
                };

            this.save(null, defaults);

            return this;
        },

        remove: function (options) {
            var defaults = {
                url: this.urls.remove + '/' + this.get('_id'),
                type: 'POST'
            };

            return this.save(null, defaults);
        }
    });

    return Application;
});