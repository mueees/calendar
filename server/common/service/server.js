var dnode = require('dnode'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    _ = require('underscore'),
    log = require('common/log')(module),
    crossroads = require('crossroads'),
    ServerError = require('./ServerError');

var defaultOptions = {
    port: null,
    api: {}
};

function Server(options) {
    this.options = _.extend(defaultOptions, options);

    if (!this.options.port) {
        log.error("Port should exist");
        throw new ServerError(0, "Port should exist");
    }

    this.port = this.options.port;

    /*
     * Api consist methods which requested side execute directly
     * */
    this._api = this.options.api;

    this._routes = [];

    this._router = crossroads.create();

    this.server = null;

    this.ServerError = ServerError;

    this.initialize();
}

Server.ServerError = ServerError;

util.inherits(Server, EventEmitter);

_.extend(Server.prototype, {
    initialize: function () {
        this.server = dnode(this._api);
        this.server.listen(this.port);

        log.info("Service Server listen " + this.port + " port");

        this._initApi();
    },

    // add new api methods
    api: function (api) {
        _.extend(this._api, api);
    },

    // add universal 'request' api method
    _initApi: function () {
        var me = this;

        this.api({
            request: function () {
                me._requestHandler(arguments);
            }
        });
    },

    /*
     * This is universal handler for request
     * When the requested side doesn't know which method sever has to execute
     * */
    _requestHandler: function (arguments) {
        var args = [].slice.call(arguments),
            requestString = args.splice(0, 1);

        if (!this._isHasMatchRoute(requestString)) {
            var callback = args.pop();

            log.error('Invalid request method');
            callback(new ServerError(401, 'Invalid request method'));
        } else {
            this._router.parse(requestString, args);
        }
    },

    _isHasMatchRoute: function (request) {
        return _.filter(this._routes, function (route) {
            return route.match(request);
        }).length;
    },

    // add route to universal 'request' api method
    addRoute: function (path, fn) {
        var route = this._router.addRoute(path, fn);

        // store all route, for checking in '_requestHandler', that we have handler for request
        this._routes.push(route);
    }
});

module.exports = Server;