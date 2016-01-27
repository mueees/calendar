var MueRequest = require('./index'),
    app = 'account',
    service = 'api';

function getUser(data) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/user/' + data.userId
    });
}

exports.getUser = getUser;