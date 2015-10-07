var HttpError = require('common/errors/HttpError');

module.exports = function (request, response, next) {
    if (!request.headers.userid) {
        next(new HttpError(400, 'Cannot find userId'));
    } else {
        request.userId = request.headers.userid;
        next();
    }
};