var dnode = require('dnode'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    _ = require('underscore'),
    ServerError = require('./ServerError');

var defaultOptions = {
    port: null,
    api: {}
};

function Server(options) {
    this.options = _.extend(defaultOptions, options);

    if (!this.options.port) {
        throw new ServerError(0, "Port should exist");
    }

    this.port = this.options.port;

    this._api = this.options.api;

    this.server = null;

    this.initialize();
}

util.inherits(Server, EventEmitter);

_.extend(Server.prototype, {
    initialize: function () {
        this.server = dnode(this._api);
        this.server.listen(this.port);

        console.log("Server listen " + this.port + " port");
    },

    // add new api methods
    api: function (api) {
        _.extend(this._api, api);
    }
});

module.exports = Server;