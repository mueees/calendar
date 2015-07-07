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
    server.addRoute('/version', function (options, callback) {
        callback(null, {
            version: calendarConfig.get('services:api:version')
        });
    });

    server.addRoute('/create', function (options, callback) {
        if (!options.data.name) {
            callback(new ServerError(400, 'Name should exists'));
        }

        var data = options.data;
        data.userId = options.userId;

        Calendar.create(data, function (err, calendar) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, 'Server error'));
            }

            callback(null, {
                _id: calendar._id
            });
        });
    });

    server.addRoute('/calendar/{id}', function (options, callback, id) {
        Calendar.findOne({
            _id: id,
            userId: options.userId
        }, function (err, calendar) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, 'Server error'));
            }

            if (!calendar) {
                callback(new ServerError(400, 'Cannot find calendar'));
            } else {
                callback(null, {
                    _id: calendar._id,
                    name: calendar.name,
                    description: calendar.description
                });
            }
        });
    });

    // todo: "/calendar/delete" and "/calendar/{id}" the same url for server!
    server.addRoute('/calendar/delete', function (options, callback) {
        if (!options.data._id) {
            callback(new ServerError(400, 'Id should exists'));
        }

        log.info(options);

        Calendar.remove({
            _id: options.data._id,
            userId: options.userId
        }, function (err) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, 'Server error'));
            }

            callback(null, {});
        });
    });
};