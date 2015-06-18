var path = require("path"),
    http = require("http"),
    util = require("util");

function OauthError(status, message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, OauthError);

    this.status = status;
    this.message = message || http.STATUS_CODES[status] || "Error";
}

util.inherits(OauthError, Error);

OauthError.prototype.name = "OauthError";

module.exports = OauthError;