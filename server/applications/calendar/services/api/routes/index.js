var Calendar = require('../../../common/resources/calendar'),
    Event = require('../../../common/resources/event'),
    log = require('common/log')(module),
    async = require('async'),
    helpers = require('common/helpers'),
    _ = require('underscore'),
    HttpError = require('common/errors/HttpError');

var prefix = '/api/calendar',
    eventDefaultFields = ['_id', 'rowId', 'title', 'description', 'rawId',
        'calendarId', 'start', 'end', 'isAllDay', 'isRepeat',
        'repeatType', 'repeatEnd', 'repeatDays'];

module.exports = function (app) {

    // CALENDAR

    // create calendar
    app.put(prefix + '/calendars', function (request, response, next) {
        var calendarData = request.body;

        if (!calendarData.name) {
            return next(new HttpError(400, 'Name should exists'));
        }

        calendarData.userId = request.userId;

        Calendar.create(calendarData, function (err, calendar) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            response.send({
                _id: calendar._id
            });
        });
    });

    // edit calendar
    app.post(prefix + '/calendars/:id', function (request, response, next) {
        var updateData = _.pick(request.body, [
            'name',
            'description',
            'active',
            'color'
        ]);

        Calendar.update({
            _id: request.params.id,
            userId: request.userId
        }, updateData, function (err) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            updateData._id = request.params.id;

            response.send(updateData);
        });
    });

    // find calendar by criteria
    app.get(prefix + '/calendars', function (request, response, next) {
        request.query = request.query || {};
        request.query.userId = request.userId;

        Calendar.find(request.query, {
            '_id': true,
            'name': true,
            'description': true,
            'active': true,
            'color': true
        }, function (err, calendars) {
            if (err) {
                log.error(err.message);

                return next(new HttpError(400, 'Server Error'));
            }

            response.send(calendars);
        });
    });

    // delete calendar
    app.delete(prefix + '/calendars/:id', function (request, response, next) {
        async.parallel([
            function (cb) {
                Calendar.remove({
                    _id: request.params.id,
                    userId: request.userId
                }, cb);
            },
            function (cb) {
                Event.remove({
                    calendarId: request.params.id
                }, cb);
            }
        ], function (err) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            response.send({});
        });
    });

    // EVENTS

    // create event
    app.put(prefix + '/events', function (request, response, next) {
        var data = request.body;

        if (!data.calendarId) {
            return next(new HttpError(400, 'Calendar id should exist'));
        }

        if (!data.title) {
            return next(new HttpError(400, 'Title should exist'));
        }

        if (!data.start) {
            return next(new HttpError(400, 'Start day should exist'));
        }

        if (!data.end) {
            return next(new HttpError(400, 'End day should exist'));
        }

        if (data.isRepeat) {
            if (!data.repeatType) {
                return next(new HttpError(400, 'Repeat type should exist'));
            }

            if (data.repeatType == 2 && !data.repeatDays) {
                return next(new HttpError(400, 'Repeat days should exist'));
            }
        }

        Event.create(data, function (err, event) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(400, 'Server error'));
            }

            response.send({
                _id: event._id
            });
        });
    });

    // find events
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
            cloneEvent._id = helpers.util.getUUID();
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
            if (event.repeatEnd && d >= event.repeatEnd || !_.contains(days, String(d.getDay()))) {
                continue;
            }

            var cloneEvent = _.clone(event);

            cloneEvent.rawId = event._id;
            cloneEvent._id = helpers.util.getUUID();
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
                cloneEvent._id = helpers.util.getUUID();
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
                cloneEvent._id = helpers.util.getUUID();
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

    app.post(prefix + '/events/find', function (request, response, next) {
        var data = request.body;

        if (!data) {
            return next(new HttpError(400, 'Options should exists'));
        }

        if (!data.start) {
            return next(new HttpError(400, 'Start day should exists'));
        }

        if (!data.end) {
            return next(new HttpError(400, 'End day should exists'));
        }

        // fields, which event fields api should return
        if (data.fields) {
            if (_.isArray(data.fields)) {
                if (!data.fields.length) {
                    return next(new HttpError(400, 'Fields cannot be empty'));
                }
            } else {
                return next(new HttpError(400, 'Fields should be array'));
            }
        }

        if (!_.isArray(data.calendarIds)) {
            data.calendarIds = [data.calendarIds];
        }

        if (!data.calendarIds.length) {
            return next(new HttpError(400, 'Calendar ids cannot be empty'));
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
                    calendarId: {
                        $in: data.calendarIds
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
                    isRepeat: true,
                    calendarId: {
                        $in: data.calendarIds
                    }
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
                    isRepeat: true,
                    calendarId: {
                        $in: data.calendarIds
                    }
                }
            ]
        };

        Event.find(query, {}, function (err, events) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(400, 'Server error'));
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
                fields = data.fields;
                fields.push('_id', 'rawId');
            } else {
                fields = eventDefaultFields;
            }

            result = _.map(result, function (event) {
                return _.pick(event, fields);
            });

            response.send(result);
        });
    });

    // edit event
    app.post(prefix + '/events/:id', function (request, response, next) {
        Event.findOne({
            _id: request.params.id
        }, null, function (err, event) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            if (!event) {
                return next(new HttpError(400, 'Cannot find event'));
            } else {
                var updateData = _.pick(request.body, [
                    'title',
                    'description',
                    'start',
                    'end',
                    'isRepeat',
                    'repeatType',
                    'repeatDays',
                    'repeatEnd',
                    'isAllDay',
                    'calendarId'
                ]);

                if (!updateData.isRepeat) {
                    delete updateData.repeatType;
                    delete updateData.repeatDays;
                    delete updateData.repeatEnd;
                }

                if (updateData.isRepeat) {
                    if (!updateData.repeatType) {
                        return next(new HttpError(400, 'Repeat type should exist'));
                    }

                    if (updateData.repeatType == 2 && !updateData.repeatDays) {
                        return next(new HttpError(400, 'Repeat days should exist'));
                    }
                }

                if (event.isRepeat && !updateData.isRepeat) {
                    event.repeatEnd = event.repeatType = event.repeatDays = null;
                }

                _.assign(event, updateData);

                event.save(function (err) {
                    if (err) {
                        log.error(err);
                        return next(new HttpError(400, 'Server error'));
                    }

                    response.send(_.pick(event, eventDefaultFields));
                });
            }
        });
    });

    // delete event
    app.delete(prefix + '/events/:id', function (request, response, next) {
        Event.remove({
            _id: request.params.id
        }, function (err) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            response.send({});
        });
    });

    // get event by id
    app.get(prefix + '/events/:id', function (request, response, next) {
        Event.findOne({
            _id: request.params.id
        }, function (err, event) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            if (!event) {
                next(new HttpError(400, 'Cannot find event'));
            } else {
                // check is user has access to this event
                Calendar.findOne({
                    _id: event.calendarId,
                    userId: request.userId
                }, function (err, calendar) {
                    if (err) {
                        log.error(err);
                        return next(new HttpError(400, 'Server error'));
                    }

                    if (!calendar) {
                        return next(new HttpError(400, 'You dont have access.'));
                    } else {
                        response.send(_.pick(event, eventDefaultFields));
                    }
                });
            }
        });
    });
};