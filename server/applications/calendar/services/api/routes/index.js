var ServerError = require('../../../common/error/ServerError'),
    log = require('common/log')(module),
    calendarConfig = require('../../../config'),
    _ = require('underscore'),
    Calendar = require('../../../common/resources/calendar'),
    Event = require('../../../common/resources/event');

module.exports = function (server) {
    server.addRoute('/version', function (callback) {
        callback(null, {
            version: calendarConfig.get('services:api:version')
        });
    });

    // Calendar
    server.addRoute('/calendar/create', function (options, callback) {
        if (!options.data.name) {
            return callback(new ServerError(400, 'Name should exists'));
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

    server.addRoute('/calendar/all', function (options, callback) {
        Calendar.find({
            userId: options.userId
        }, function (err, calendars) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, 'Server error'));
            }

            calendars = _.map(calendars, function (calendar) {
                return {
                    _id: calendar._id,
                    name: calendar.name,
                    description: calendar.description
                }
            });

            callback(null, calendars);
        });
    });

    server.addRoute('/calendar/get/{id}', function (options, callback, id) {
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

    server.addRoute('/calendar/delete', function (options, callback) {
        if (!options.data._id) {
            callback(new ServerError(400, 'Id should exists'));
        }

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

    // Event
    server.addRoute('/event/create', function (options, callback) {
        var data = options.data;

        if (!data.calendarId) {
            return callback(new ServerError(400, 'Calendar id should exist'));
        }

        if (!data.title) {
            return callback(new ServerError(400, 'Title should exist'));
        }

        if (!data.startDay) {
            return callback(new ServerError(400, 'Start day should exist'));
        }

        if (!data.endDay) {
            return callback(new ServerError(400, 'End day should exist'));
        }

        if (!data.isAllDay) {
            if (!data.startTime) {
                return callback(new ServerError(400, 'Start time should exist'));
            }

            if (!data.endTime) {
                return callback(new ServerError(400, 'End time should exist'));
            }
        }

        if (data.isRepeat) {
            if (!data.repeat) {
                return callback(new ServerError(400, 'Repeat data should exist'));
            }

            if (!data.repeat.type) {
                return callback(new ServerError(400, 'Repeat type should exist'));
            }

            if (data.repeat.type == 3 && !data.repeat.options.days) {
                return callback(new ServerError(400, 'Repeat days should exist'));
            }
        }

        Event.create(data, function (err, event) {
            if (err) {
                log.error(err);

                return callback(new ServerError(400, 'Server error'));
            }

            callback(null, {
                _id: event._id
            });
        });
    });

    server.addRoute('/event/delete', function (options, callback) {
        if (!options.data._id) {
            callback(new ServerError(400, 'Id should exists'));
        }

        Event.remove({
            _id: options.data._id
        }, function (err) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, 'Server error'));
            }

            callback(null, {});
        });
    });

    server.addRoute('/event/find', function (options, callback) {
        var data = options.data;

        if (!data.startDay) {
            callback(new ServerError(400, 'Start day should exists'));
        }

        if (!data.endDay) {
            callback(new ServerError(400, 'End day should exists'));
        }

        if (data.fields && !_.isArray(data.fields)) {
            callback(new ServerError(400, 'Fields should be array'));
        }

    });
};