define([
    'core/fake-server/fake-server.service'
], function ($mFakeServer) {
    var prefix = '/api/v1';

    // USER
    // user signup
    $mFakeServer.setHandler({
        url: prefix + "/signup",
        status: 200,
        responseText: {}
    });

    // user signin
    $mFakeServer.setHandler({
        url: prefix + "/signin",
        status: 200,
        responseText: {
            "token": "test access_token"
        }
    });
});