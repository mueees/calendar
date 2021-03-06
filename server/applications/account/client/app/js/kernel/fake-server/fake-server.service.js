define([
    'clientCore/fake-server/fake-server.service'
], function ($mFakeServer) {
    var prefix = '/api/v1';

    // AUTH

    // user signup
    /*$mFakeServer.setHandler({
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

     // user logout
     $mFakeServer.setHandler({
     url: prefix + "/logout",
     status: 200,
     responseText: {}
     });

     // APPLICATION

     // get application by id
     $mFakeServer.setHandler({
     url: prefix + "/application/123",
     status: 200,
     responseText: {
     _id: 123,
     name: 'Calendar'
     }
     });

     $mFakeServer.setHandler({
     url: prefix + "/application/approve",
     status: 200,
     responseText: {
     token: 'token for external app'
     }
     });*/

    // create application
    /*$mFakeServer.setHandler({
     url: prefix + "/application/create",
     status: 200,
     responseText: {
     _id: getUUID(),
     publicKey: 'publicKey',
     privateKey: 'privateKey',
     date_create: new Date()
     }
     });*/

    // generate new private key
    $mFakeServer.setHandler({
        url: prefix + "/application/privateKey",
        status: 200,
        responseText: {
            privateKey: getUUID() + ''
        }
    });

    function getUUID() {
        return Math.random() + (new Date()).getTime();
    }
});