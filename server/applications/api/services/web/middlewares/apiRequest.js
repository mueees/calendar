var request = require('request'),
    HttpError = require('common/errors/HttpError');

module.exports = function (req, res, next) {
    var options = {
        url: 'http://localhost:' + req.service.port + req.originalUrl,
        method: req.method,
        headers: {
            'x-requested-with': 'XMLHttpRequest',
            userId: req.headers.userId
        },
        json: true,
        timeout: 3000
    };

    if (JSON.stringify(req.body) != '{}') {
        options.body = req.body;
    }

    var r = request(options);

    r.on('error', function (err) {
        next(new HttpError(400, 'Request timeout'));
    });

    r.pipe(res);
};