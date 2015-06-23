var winston = require('winston'),
    path = require('path'),
    ENV = process.env.NODE_ENV;

function Logger(module) {
    var pathModule = module.filename.split("/").slice(-2).join('/');

    var win = new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true
            })
        ]
    });

    function send(type, message) {
        if (type == 'warning') {
            win.warn(message, {
                extra: pathModule
            });
        } else {
            win[type](message, {
                extra: pathModule
            });
        }
    };

    this.info = function (message) {
        send('info', message);
    };

    this.warning = function (message) {
        send('warning', message);
    };

    this.error = function (message) {
        send('error', message);
    };
}

function getLogger( module ){
    return new Logger(module);
}

module.exports = getLogger;