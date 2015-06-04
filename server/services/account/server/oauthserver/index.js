var oauthserver = require('../modules/oauthserver'),
    Application = require('common/resources/application'),
    HttpError = require('common/errors/HttpError');

var server = oauthserver.createServer();

server.processError = function (number, message, next) {
    next(new HttpError(number, message));
};

module.exports = server;