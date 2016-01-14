var RabbitRequest = require('common/request/rabbit'),
    RABBIT_ERRORS = require('./errors'),
    _ = require('lodash'),
    log = require('common/log')(module);

function isValidError(error) {
    var isValid = true;

    if (!error.errorCode) {
        isValid = false;
    } else {
        var RABBIT_ERROR = _.find(RABBIT_ERRORS, {
            code: error.errorCode
        });

        if (!RABBIT_ERROR) {
            isValid = false;
        } else {
            if (RABBIT_ERROR.code != 666) {
                _.each(RABBIT_ERROR.fields, function (field) {
                    if (isValid && !_.has(error.data, field)) {
                        isValid = false;
                    }
                });
            }
        }
    }

    return isValid;
}

function sendError(error) {
    if (isValidError(error)) {
        RabbitRequest.sendErrorReport(error);
    }
}

module.exports = {
    sendError: sendError,
    isValidError: isValidError
};