define([
    'core/resource/base.model',
    'config/app'
], function (BaseModel, config) {
    var Application = BaseModel.extend({
        urlRoot: '/api/v' + config.api.version,

        defaults: {
            publicKey: '',
            privateKey: '',
            name: ''
        }
    });

    return Application;
});