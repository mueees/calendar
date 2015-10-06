var HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    if (!request.headers.userid) {
        return next(new HttpError('Cannot find userId'))
    } else {
        request.userId = request.headers.userid;
        next();
    }
};