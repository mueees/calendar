define([
    'core/resource/base.model',
    'config/app'
], function (BaseModel, config) {
    var Application = BaseModel.extend({
        urlRoot: '/api/v' + config.api.version + '/application/create',

        urls: {
            privateKey: '/api/v' + config.api.version + '/application/privateKey'
        },

        defaults: {
            publicKey: '',
            privateKey: '',
            date_create: '',
            redirectUrl: '',
            name: '',
            status: '200',
            description: ''
        },

        validation: {
            name: {
                required: true
            },
            redirectUrl: {
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
        }
    });

    return Application;
});