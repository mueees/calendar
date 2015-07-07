var ServerError = require('../../../common/error/ServerError'),
    log = require('common/log')(module),
    calendarConfig = require('../../../config'),
    Calendar = require('../../../common/resources/calendar');

var api = {
    create: function (options, callback) {
        if (!options.data.name) {
            callback(new ServerError(400, 'Name should exists'));
        }

        Calendar.create(options.data, function (err, calendar) {
            if (err) {
                log.error(err);
                return cb(new ServerError(400, 'Server error'));
            }

            cb(null, calendar);
        });
    },

    remove: function (options, callback) {
        if (!options.data._id) {
            callback(new ServerError(400, 'Id should exists'));
        }

        Calendar.remove({
            _id: options.data._id,
            userId: options.userId
        }, function (err) {
            if (err) {
                return callback(new ServerError(400, "Server error"));
            }

            callback(null);
        });
    }
};

module.exports = function (server) {
    server.addRoute('/version', function (callback) {
        callback(null, calendarConfig.get('services:api:version'));
    });

    server.api(api);
};