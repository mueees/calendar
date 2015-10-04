var MueRequest = require('./index'),
    app = 'oauth',
    service = 'web';

function createApplication(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'PUT',
        url: '/applications',
        body: data
    });
}

function editApplication(data) {
    var _id = data._id;

    delete data._id;

    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/applications/' + _id,
        body: data
    });
}

function deleteApplication(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'DELETE',
        url: '/applications',
        body: data
    });
}

function getApplications(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/applications?userId=' + data.userId
    });
}

exports.getApplications = getApplications;
exports.createApplication = createApplication;
exports.editApplication = editApplication;
exports.deleteApplication = deleteApplication;
