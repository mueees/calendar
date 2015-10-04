var request = require('request'),
    configuration = require('configuration'),
    Q = require('q');

function MueRequest() {
}

MueRequest.request = function (options) {
    var port = configuration.get("applications:" + options.app + ":services:" + options.service + ":port"),
        def = Q.defer();

    options.url = 'http://localhost:' + port + '/api/' + options.app + options.url;

    options.timeout = 2000;

    options.json = true;

    options.headers = {
        'mue-inner-request': 'true'
    };

    request(options, function (err, response, body) {
        if (err) {
            def.reject(err);
            return false;
        }

        if (response.statusCode == 200) {
            def.resolve({
                response: response,
                body: body
            });
        } else {
            def.reject(response);
        }
    });

    return def.promise;
};

module.exports = MueRequest;