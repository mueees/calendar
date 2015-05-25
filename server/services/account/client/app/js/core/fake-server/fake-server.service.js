define([
    'jquery',
    'mockajax'
], function ($) {
    var prefix = '/api/v1';

    // USER
    // user signup
    $.mockjax({
        url: prefix + "/signup",
        status: 200,
        responseText: {
            status: "success",
            fortune: "Are you a mock turtle?"
        }
    });

    // user signin
    $.mockjax({
        url: prefix + "/signin",
        status: 200,
        responseText: {
            "token": "test access_token"
        }
    });

});