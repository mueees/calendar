var ServerError = require('../../../common/error/ServerError'),
    log = require('common/log')(module),
    calendarConfig = require('../../../config'),
    _ = require('underscore'),
    async = require('async'),
    moment = require('moment'),
    Calendar = require('../../../common/resources/calendar'),
    Event = require('../../../common/resources/event');

require('moment-range');

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

    server.addRoute('/calendar/edit', function (options, callback) {
        if (!options.data._id) {
            return callback(new ServerError(400, 'Id should exists'));
        }

        var updateData = _.pick(options.data, ['name', 'description', 'active', 'color']);

        Calendar.findOne({
            _id: options.data._id,
            userId: options.userId
        }, function (err, calendar) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, 'Server error'));
            }

            if (!calendar) {
                return callback(new ServerError(400, 'Cannot find calendar'));
            } else {
                _.assign(calendar, updateData);

                calendar.save(function (err) {
                    if (err) {
                        log.error(err);
                        return callback(new ServerError(400, 'Server error'));
                    }

                    callback(null, calendar);
                });
            }
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
                return _.pick(calendar, [
                    '_id',
                    'name',
                    'description',
                    'active',
                    'color'
                ]);
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

        async.parallel([
            function (cb) {
                Calendar.remove({
                    _id: options.data._id,
                    userId: options.userId
                }, cb);
            },
            function (cb) {
                Event.remove({
                    calendarId: options.data._id
                }, cb);
            }
        ], function (err) {
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

        if (!data.start) {
            return callback(new ServerError(400, 'Start day should exist'));
        }

        if (!data.end) {
            return callback(new ServerError(400, 'End day should exist'));
        }

        if (data.isRepeat) {
            if (!data.repeatType) {
                return callback(new ServerError(400, 'Repeat type should exist'));
            }

            if (data.repeatType == 2 && !data.repeatDays) {
                return callback(new ServerError(400, 'Repeat days should exist'));
            }
        }

        Event.create(data, function (err, event) {
            if (err) {
                log.error(err.message);
                return callback(new ServerError(400, 'Server error'));
            }

            callback(null, {
                _id: event._id
            });
        });
    });

    server.addRoute('/event/edit', function (options, callback) {
        if (!options.data._id) {
            return callback(new ServerError(400, 'Id should exists'));
        }

        Event.findOne({
            _id: options.data._id
        }, null, function (err, event) {
            if (err) {
                log.error(err);
                return callback(new ServerError(400, 'Server error'));
            }

            if (!event) {
                return callback(new ServerError(400, 'Cannot find event'));
            } else {
                var updateData = _.pick(options.data, ['title', 'description', 'start', 'end', 'isRepeat', 'repeatType', 'repeatDays', 'repeatEnd', 'isAllDay']);

                if (!updateData.isRepeat) {
                    delete updateData.repeatType;
                    delete updateData.repeatDays;
                    delete updateData.repeatEnd;
                }

                if (updateData.isRepeat) {
                    if (!updateData.repeatType) {
                        return callback(new ServerError(400, 'Repeat type should exist'));
                    }

                    if (updateData.repeatType == 3 && !updateData.repeatDays) {
                        return callback(new ServerError(400, 'Repeat days should exist'));
                    }
                }

                if (event.isRepeat && !updateData.isRepeat) {
                    event.repeatEnd = event.repeatType = event.repeatDays = null;
                }

                _.assign(event, updateData);

                event.save(function (err) {
                    if (err) {
                        log.error(err);
                        return callback(new ServerError(400, 'Server error'));
                    }

                    callback(null, event);
                });
            }
        });
    });

    server.addRoute('/event/delete', function (options, callback) {
        if (!options.data._id) {
            return callback(new ServerError(400, 'Id should exists'));
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

    function setTime(dateTarget, dateSource) {
        var date = new Date(dateTarget.getTime());

        date.setHours(dateSource.getHours(), dateSource.getMinutes(), dateSource.getSeconds(), dateSource.getMilliseconds());
        return date;
    }

    function generateDailyEvents(event, start, end) {
        var result = [],
            d = new Date(start);

        for (d; d <= end; d.setDate(d.getDate() + 1)) {
            if (event.repeatEnd && d >= event.repeatEnd) {
                continue;
            }

            var cloneEvent = _.clone(event);

            cloneEvent.rawId = event._id;
            cloneEvent._id = Math.random();
            cloneEvent.start = setTime(d, event.start);
            cloneEvent.end = setTime(d, event.end);

            result.push(cloneEvent);
        }

        return result;
    }

    function generateEventsByDays(event, start, end, days) {
        var result = [],
            d = new Date(start);

        for (d; d <= end; d.setDate(d.getDate() + 1)) {
            if (event.repeatEnd && d >= event.repeatEnd || !_.contains(days, d.getDay())) {
                continue;
            }

            var cloneEvent = _.clone(event);

            cloneEvent.rawId = event._id;
            cloneEvent._id = Math.random();
            cloneEvent.start = setTime(d, event.start);
            cloneEvent.end = setTime(d, event.end);

            result.push(cloneEvent);
        }

        return result;
    }

    function generateMonthlyEvents(event, start, end) {
        var result = [],
            d = new Date(event.start.getTime()),
            endDate = end;

        if (event.repeatEnd && event.repeatEnd < end) {
            endDate = event.repeatEnd;
        }

        var range = moment.range(start, endDate);

        while (d <= endDate) {
            if (range.contains(d)) {
                var cloneEvent = _.clone(event);

                cloneEvent.rawId = event._id;
                cloneEvent._id = Math.random();
                cloneEvent.start = setTime(d, event.start);
                cloneEvent.end = setTime(d, event.end);

                result.push(cloneEvent);
            }

            d.setMonth(d.getMonth() + 1);
        }

        return result;
    }

    function generateYearlyEvents(event, start, end) {
        var result = [],
            d = new Date(event.start.getTime()),
            endDate = end;

        if (event.repeatEnd && event.repeatEnd < end) {
            endDate = event.repeatEnd;
        }

        var range = moment.range(start, endDate);

        while (d <= endDate) {
            if (range.contains(d)) {
                var cloneEvent = _.clone(event);

                cloneEvent.rawId = event._id;
                cloneEvent._id = Math.random();
                cloneEvent.start = setTime(d, event.start);
                cloneEvent.end = setTime(d, event.end);

                result.push(cloneEvent);
            }

            d.setFullYear(d.getFullYear() + 1);
        }

        return result;
    }

    function generateEvents(repeatedEvents, start, end) {
        var result = [];

        repeatedEvents = repeatedEvents || [];

        /*
         http://doc.mue.in.ua/display/MUE/Application+API

         repeatType:
         1 - daily
         2 - weekly
         3 - monthly
         4 - yearly
         */

        _.each(repeatedEvents, function (repeatedEvent) {
            switch (repeatedEvent.repeatType) {
                case 1:
                    result = result.concat(generateDailyEvents(repeatedEvent, start, end));
                    break;
                case 2:
                    result = result.concat(generateEventsByDays(repeatedEvent, start, end, repeatedEvent.repeatDays));
                    break;
                case 3:
                    result = result.concat(generateMonthlyEvents(repeatedEvent, start, end));
                    break;
                case 4:
                    result = result.concat(generateYearlyEvents(repeatedEvent, start, end));
                    break;
            }
        });

        return result;
    }

    server.addRoute('/event/find', function (options, callback) {
        var data = options.data;

        if (!data) {
            return callback(new ServerError(400, 'Options should exists'));
        }

        if (!data.start) {
            return callback(new ServerError(400, 'Start day should exists'));
        }

        if (!data.end) {
            return callback(new ServerError(400, 'End day should exists'));
        }

        // fields, which event fields api should return
        if (data.fields) {
            if (_.isArray(data.fields)) {
                if (!data.fields.length) {
                    return callback(new ServerError(400, 'Fields cannot be empty'));
                }
            } else {
                return callback(new ServerError(400, 'Fields should be array'));
            }
        }

        if (!_.isArray(data.calendarIds)) {
            return callback(new ServerError(400, 'Calendar ids should be array'));
        }

        if (!data.calendarIds.length) {
            return callback(new ServerError(400, 'Calendar ids cannot be empty'));
        }

        data.start = new Date(data.start);
        data.start.setHours(0, 0, 0, 0);

        data.end = new Date(data.end);
        data.end.setHours(23, 59, 59, 999);

        var query = {
            $or: [
                // no repeat, just between two dates
                {
                    start: {
                        $gt: data.start,
                        $lt: data.end
                    },
                    isRepeat: false
                },
                // repeated events without repeatEnd
                {
                    start: {
                        $lt: data.end
                    },
                    repeatEnd: {
                        $exists: false
                    },
                    isRepeat: true
                },
                // repeated events with repeatEnd
                {
                    start: {
                        $lt: data.end
                    },
                    repeatEnd: {
                        $exists: true,
                        $gt: data.start
                    },
                    isRepeat: true
                }
            ]
        };

        Event.find(query, {}, function (err, events) {
            if (err) {
                log.error(err.message);
                return callback(new ServerError(400, 'Server error'));
            }

            events = events.map(function (event) {
                return event.toObject();
            });

            var result = [];

            // add clear event, that doesn't repeat
            result = result.concat(_.filter(events, function (event) {
                return !event.isRepeat;
            }));

            // generate events from repeated events
            result = result.concat(generateEvents(_.filter(events, function (event) {
                return event.isRepeat;
            }), data.start, data.end));

            // filter fields
            var fields = [];

            if (data.fields) {
                fields = data.fields
            } else {
                fields = ['_id', 'rowId', 'title', 'description',
                    'calendarId', 'start', 'end', 'isAllDay', 'isRepeat',
                    'repeatType', 'repeatEnd', 'repeatDays'];
            }

            result = _.map(result, function (event) {
                return _.pick(event, fields);
            });

            callback(null, result);
        });
    });
};