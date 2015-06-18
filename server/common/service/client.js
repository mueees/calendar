var dnode = require('dnode'),
    events = require('events'),
    util = require('util'),
    _ = require('underscore'),
    ClientError = require('./ClientError');

var defaultOptions = {
    port: null,
    reconnect: true,
    reconnectTime: 2000,
    collectStats: false,
    log: false
};

function Client(options) {
    var me = this;

    this.options = _.extend(defaultOptions, options);

    if (!this.options.port) {
        throw new ClientError(0, 'Port should exist');
    }

    /*_remote service port*/
    this.port = options.port;

    /* _remote service */
    this._remote = null;

    /* _remote connection */
    this.connection = null;

    this._stats = {
        countRequest: 0,
        successRequest: 0,
        errorRequest: 0,
        averageResponseTime: 0,
        _allResponseTime: 0
    };

    // connect to _remote server
    this._connect();

    if (this.options.collectStats) {
        setInterval(function () {
            me.log(me.getStats())
        }, 2000);
    }
}

util.inherits(Client, events.EventEmitter);

_.extend(Client.prototype, {
    _connect: function () {
        var me = this;

        this.connection = dnode.connect(this.port);

        this.connection.on('remote', function (remote) {
            console.log('Service Client has established connection with remote server:' + me.port);

            me._remote = remote;
            me.emit('remote');
        });

        /*
         * This event fires when the _remote end causes errors in the protocol layer.
         * These are non-fatal and can probably be ignored but you could also terminate
         * the connection here.
         * */
        this.connection.on('fail', function () {
            console.log('Connect was failed');

            me.emit('fail');
            me.reconnect();
        });

        // _remote server was crashed
        this.connection.on('end', function () {
            console.log("Remote service disconnect.");

            me._remote = null;
            me.emit('end');
            me.reconnect();
        });

        /*
         * This event fires when local code causes errors in its callbacks.
         * Not all errors can be caught here since some might be in async functions.
         * */
        this.connection.on('error', function () {
            console.log("Remote service get error on callback.");

            me._remote = null;
            me.reconnect();
        });
    },

    reconnect: function () {
        var me = this;

        if (this.options.reconnect) {
            setTimeout(function () {
                me._connect();
                me.emit('reconnect');
            }, this.options.reconnectTime);
        }
    },

    log: function (message) {
        if (this.options.log) {
            console.log(message);
        }
    },

    exec: function (methodName) {
        var args = [].splice.call(arguments, 0),
            originalCallback = args.pop(),
            me = this;

        // remove method name from args
        args.splice(0, 1);

        if (!this._remote) {
            originalCallback(new ClientError(500, 'Does not have connection with remote service'));
        } else if (!this._remote[methodName]) {
            originalCallback(new ClientError(500, "Doesn't have " + methodName + " method"));
        } else {
            if (this.options.collectStats) {
                var startRequest = new Date(),
                    callback = function (err) {
                        if (err) {
                            me._stats.errorRequest += 1;
                        } else {
                            me._stats.successRequest += 1;
                        }

                        me._stats._allResponseTime += new Date() - startRequest.getTime();
                        me._stats.averageResponseTime = me._stats._allResponseTime / me._stats.successRequest;

                        originalCallback.apply(this, arguments);
                    };

                me._stats.countRequest += 1;
                args.push(callback);
            } else {
                args.push(originalCallback);
            }

            // execute request
            this.log('execute method ' + methodName);

            this._remote[methodName].apply(this, args);
        }
    },

    getStats: function () {
        return this._stats;
    },

    isConnected: function () {
        return this._remote;
    }
});

module.exports = Client;