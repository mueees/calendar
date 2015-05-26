define([
    'core/resource/base',
    'config/app'
], function (BaseModel, config) {
    var prefix = '/api/v' + config.api.version;

    var Application = BaseModel.extend({
        urlRoot: prefix + '/application'
    });

    return Application;
});