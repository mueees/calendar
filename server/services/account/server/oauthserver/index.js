var oauthserver = require('../modules/oauthserver'),
    Application = require('common/resources/application'),
    HttpError = require('common/errors/HttpError');

var server = oauthserver.createServer();

module.exports = server;