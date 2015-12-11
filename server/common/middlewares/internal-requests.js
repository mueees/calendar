var HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    if (request.headers['mue-inner-request'] == 'mue-inner-request') {
        next();
    } else {
        next(new HttpError(404));
    }
};