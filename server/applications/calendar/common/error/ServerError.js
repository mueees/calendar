var path = require("path"),
    http = require("http"),
    util = require("util");

function ServerError(status, message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, ServerError);

    this.status = status;
    this.message = message || "Error";
}

util.inherits(ServerError, Error);

ServerError.prototype.name = "ServerError";

module.exports = ServerError;