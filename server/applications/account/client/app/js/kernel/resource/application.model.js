define([
    'core/resource/base.model',
    'config/app'
], function (BaseModel, config) {
    var Application = BaseModel.extend({
        urlRoot: '/api/application',

        urls: {
            privateKey: '/api/application/privateKey',
            remove: '/api/application/remove',
            fetchByApplicationId: '/api/application/by/applicationid'
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
        },

        fetchByApplicationId: function () {
            return this.fetch({
                url: this.urls.fetchByApplicationId + '/' + this.get('applicationId'),
                type: 'GET'
            });
        },

        findOne: function (options) {
            var data = {
                    _id: this.get('_id')
                },
                defaults = {
                    url: this.urls.findOne,
                    type: 'GET',
                    data: JSON.stringify(data)
                };

            this.save(null, defaults);

            return this;
        }
    });

    return Application;
});