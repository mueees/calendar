define([
    'core/resource/base.collection',
    './application.model',
    'config/app'
], function (BaseCollection, ApplicationModel, config) {
    var ApplicationCollection = BaseCollection.extend({
        model: ApplicationModel,
        url: '/api/application/all'
    });

    return ApplicationCollection;
});