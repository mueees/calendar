module.exports = function (request, response, next) {
    if (request.headers['mue-inner-request'] == 'mue-inner-request') {
        request.isInternalRequest = true;
    }

    next();
};