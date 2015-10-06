var Calendar = require('../../../common/resources/calendar'),
    Event = require('../../../common/resources/event'),
    log = require('common/log')(module),
    async = require('async'),
    _ = require('underscore'),
    HttpError = require('common/errors/HttpError');

var prefix = '/api/calendar',
    eventDefaultFields = ['_id', 'rowId', 'title', 'description', 'rawId',
        'calendarId', 'start', 'end', 'isAllDay', 'isRepeat',
        'repeatType', 'repeatEnd', 'repeatDays'];

module.exports = function (app) {

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
};