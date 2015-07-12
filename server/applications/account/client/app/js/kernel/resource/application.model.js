define([
    'clientCore/resource/base.model',
    'config/app'
], function (BaseModel, config) {
    var Application = BaseModel.extend({
        urlRoot: '/api/application',

        urls: {
            newPrivateKey: '/api/application/newPrivateKey',
            remove: '/api/application/remove',
            fetchByApplicationId: '/api/application/by/applicationid',
            create: '/create'
        },

        defaults: {
            name: '',
            domain: '',
            description: '',
            redirectUrl: '',
            useProxy: true
        },

        validation: {
            name: {
                required: true
            },
            redirectUrl: function(){
                if(!this.get('useProxy') && !this.get('redirectUrl')){
                    return 'Redirect Url is required.'
                }
            },
            domain: {
                required: true
            }
        },

        create: function () {
            return this.save(null, {
                url: this.urlRoot + this.urls.create,
                data: JSON.stringify(this.toJSON())
            });
        },

        newPrivateKey: function () {
            var options = {
                    url: this.urls.newPrivateKey,
                    type: 'POST',
                    data: JSON.stringify({
                        applicationId: this.get('applicationId')
                    })
                };

            this.save(null, options);

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