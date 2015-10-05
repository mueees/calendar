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
        url: '/applications/' + data._id
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

function getApplicationByApplicationId(applicationId) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/applications/applicationId/' + applicationId
    });
}

function getApplicationByOauthKey(oauthKey) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/applications/oauthKey/' + oauthKey
    });
}

function auth(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/auth',
        body: data
    });
}

function exchange(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/exchange',
        body: data
    });
}

function refresh(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/refresh',
        body: data
    });
}

function newPrivateKey(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/applications/' + data._id + '/command/newPrivateKey'
    });
}

function getPermissionByAccessToken(access_token) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/permissions/accessToken/' + access_token
    });
}

exports.getApplications = getApplications;
exports.getApplicationByOauthKey = getApplicationByOauthKey;
exports.getApplicationByApplicationId = getApplicationByApplicationId;

exports.createApplication = createApplication;
exports.editApplication = editApplication;
exports.deleteApplication = deleteApplication;
exports.exchange = exchange;
exports.refresh = refresh;
exports.auth = auth;
exports.newPrivateKey = newPrivateKey;
exports.getPermissionByAccessToken = getPermissionByAccessToken;