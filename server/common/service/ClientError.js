var path = require("path"),
    http = require("http"),
    util = require("util");

function ClientError(status, message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, ClientError);

    this.status = status;
    this.message = message || "Error";
}

util.inherits(ClientError, Error);

ClientError.prototype.name = "ClintError";

module.exports = ClientError;