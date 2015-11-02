var HttpError = require('common/errors/HttpError'),
    log = require('common/log')(module),
    configuration = require('configuration'),
    request = require('request');

module.exports = function (req, res, next) {
    var options = {
        url: 'http://api.mue.in.ua' + req.originalUrl,
        method: req.method,
        headers: {
            'x-requested-with': 'XMLHttpRequest',
            Authorization: 'Bearer ' + req.user.access_token
        },
        json: true,
        timeout: 10000
    };

    if (!request.development) {
        options.url = 'http://localhost:' + configuration.get('applications:api:services:web:port') + req.originalUrl;
    }

    if (JSON.stringify(req.body) != '{}') {
        options.body = req.body;
    }

    var r = request(options);

    r.on('error', function (err) {
        log.error(err);
        
        next(new HttpError(400, 'Request timeout'));
    });

    r.pipe(res);
};