var MueRequest = require('./index'),
    app = 'oauth',
    service = 'web';

function createApplication(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'PUT',
        url: '/application',
        body: data
    });
}

function editApplication(data){
    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/application',
        body: data
    });
}

function deleteApplication(data){
    return MueRequest.request({
        app: app,
        service: service,
        method: 'DELETE',
        url: '/application',
        body: data
    });
}

function getAllApplications(data){
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/applications',
        body: data
    });
}

exports.create = createApplication;
exports.create = editApplication;
exports.create = deleteApplication;
exports.create = getAllApplications;