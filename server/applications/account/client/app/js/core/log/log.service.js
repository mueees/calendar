define([
    'underscore'
], function (_) {
    var defaultOptions = {
        canLog: true
    };

    var Logger = function (name) {
        this.name = name;
    };

    Logger.prototype = {
        log: function (data) {
            if (defaultOptions.canLog) {
                if (typeof data == 'string' || data instanceof String) {
                    this._logString(data);
                } else {
                    this._logObject(data);
                }
            }
        },

        _logString: function (text) {
            if (this.name) {
                text = this.name + ': ' + text;
            }

            console.log(text);
        },

        _logObject: function (data) {
            if (this.name) {
                console.log(this.name + ': ');
            }

            console.log(data);
        }
    };

    var logger = new Logger();

    function getLogger(name) {
        return new Logger(name);
    }

    function log(text) {
        logger.log(text);
    }

    function setOptions(options) {
        defaultOptions = _.extend(defaultOptions, options);
    }

    return {
        log: log,
        getLogger: getLogger,
        setOptions: setOptions
    }
});