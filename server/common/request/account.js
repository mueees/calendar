var MueRequest = require('./index'),
    app = 'account',
    service = 'api';

function getUser(id) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/user/' + id,
        body: data
    });
}