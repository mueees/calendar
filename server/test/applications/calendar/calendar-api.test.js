var calendar = {
        name: 'test calendar'
    },
    event = {
        calendarId: '559bfe2016bd17920826b366',
        title: 'test title',
        start: new Date(),
        end: new Date(),
        isAllDay: true,
        isRepeat: false
    },
    calendarId = '559bfe2016bd17920826b366',
    userId = '559bfe2016bd17920826b366';

var CalendarRequest = require('common/request/calendar'),
    Calendar = require('applications/calendar/common/resources/calendar'),
    Event = require('applications/calendar/common/resources/event'),
    Q = require('q'),
    moment = require('moment'),
    log = require('common/log')(module),
    calendarConfig = require('applications/calendar/config');


describe('calendar-api', function () {
    before(function (done) {
        // database connection
        require("common/mongooseConnect").initConnection(calendarConfig).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        Calendar.remove(function () {
            Event.remove(done)
        });
    });

    it('should create calendar', function (done) {
        CalendarRequest.createCalendar(calendar, userId).then(function (res) {
            if (res.body._id) {
                done();
            } else {
                done(new Error('Cannot create new calendar'));
            }
        }, function (res) {
            done(new Error(res.body.message));
        });
    });

    it('should edit calendar', function (done) {
        var newName = 'TEST';

        CalendarRequest.createCalendar(calendar, userId).then(function (res) {

            CalendarRequest.editCalendar({
                name: newName,
                _id: res.body._id
            }, userId).then(function (res) {
                if (res.body.name == newName) {
                    done();
                } else {
                    done(new Error('Cannot edit calendar'));
                }
            }, function (res) {
                done(new Error(res.body.message));
            });
        }, function (res) {
            done(new Error(res.body.message));
        });
    });

    it('should return all calendars', function (done) {
        var firstCalendar = {
                name: "First"
            },
            secondCalendar = {
                name: "Second"
            };

        Q.all([
            CalendarRequest.createCalendar(firstCalendar, userId),
            CalendarRequest.createCalendar(secondCalendar, userId)
        ]).then(function () {
            CalendarRequest.getCalendars({}, userId)
                .then(function (data) {
                    if (data.body.length == 2) {
                        done();
                    } else {
                        done(new Error('Wrong calendars length'));
                    }
                }, function (response) {
                    done(new Error(response.body.message));
                });
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should delete calendar', function (done) {
        CalendarRequest.createCalendar(calendar, userId).then(function (res) {
            CalendarRequest.deleteCalendar(res.body._id, userId).then(function () {
                done();
            }, function (res) {
                done(new Error(res.body.message));
            });
        }, function (res) {
            done(new Error(res.body.message));
        });
    });

    it('should create event', function (done) {
        CalendarRequest.createEvent(event, userId).then(function (res) {
            if (res.body._id) {
                done();
            } else {
                done(new Error('Cannot create new event'));
            }
        }, function (res) {
            done(new Error(res.body.message));
        });
    });

    it('should edit event', function (done) {
        var newTitle = 'Test title',
            newCalendarID = '559bfe2016bd17920826b361';

        CalendarRequest.createEvent(event, userId).then(function (res) {
            CalendarRequest.editEvent({
                _id: res.body._id,
                title: newTitle,
                calendarId: newCalendarID
            }, userId).then(function (res) {
                if (res.body.title == newTitle && res.body.calendarId == newCalendarID) {
                    done();
                } else {
                    done(new Error('Cannot edit event'));
                }
            }, function (res) {
                done(new Error(res.body.message));
            })
        }, function (res) {
            done(new Error(res.body.message));
        });
    });

    it('should delete event', function (done) {
        CalendarRequest.createEvent(event, userId).then(function (res) {
            CalendarRequest.deleteEvent(res.body._id, userId).then(function () {
                done();
            }, function (res) {
                done(new Error(res.body.message));
            });
        }, function (res) {
            done(new Error(res.body.message));
        });
    });

    it('should get event by id', function (done) {
        CalendarRequest.createCalendar(calendar, userId).then(function (res) {
            event.calendarId = res.body._id;

            CalendarRequest.createEvent(event, userId).then(function (res) {
                CalendarRequest.getEventById(res.body._id, userId).then(function (res) {
                    if (res.body.title) {
                        done();
                    } else {
                        done(new Error('Cannot get event by id'));
                    }
                }, function (res) {
                    done(new Error(res.body));
                });
            }, function (res) {
                done(new Error(res.body.message));
            });
        });
    });

    it('should find several events that not repeat', function (done) {
        var firstEvent = {
                title: 'test title',
                start: new Date(),
                end: new Date(),
                isAllDay: true,
                isRepeat: false,
                calendarId: calendarId
            },
            secondEvent = {
                title: 'test title 2',
                start: moment(new Date()).add(1, 'd').toDate(),
                end: moment(new Date()).add(1, 'd').toDate(),
                isAllDay: true,
                isRepeat: false,
                calendarId: calendarId
            };

        Q.all([
            CalendarRequest.createEvent(firstEvent, userId),
            CalendarRequest.createEvent(secondEvent, userId)
        ]).then(function () {
            CalendarRequest.findEvent({
                start: moment(new Date()).toDate(),
                end: moment(new Date()).add(2, 'd').toDate(),
                calendarIds: [calendarId]
            }, userId).then(function (res) {
                if (res.body.length == 2) {
                    done();
                } else {
                    done(new Error('Cannot find events'));
                }
            }, function (res) {
                done(new Error(res.body.message));
            });
        }, function (err) {
            done(new Error(err));
        });
    });

    it('should create event that repeat every day without end and find them', function (done) {
        CalendarRequest.createEvent({
            title: 'TestEvent 1',
            start: new Date(),
            end: new Date(),
            isRepeat: true,
            repeatType: 1,
            calendarId: calendarId,
            isAllDay: false
        }, userId).then(function () {
            CalendarRequest.findEvent({
                start: moment(new Date()).add(1, 'd').toDate(),
                end: moment(new Date()).add(5, 'd').toDate(),
                calendarIds: calendarId
            }, userId).then(function (res) {
                if (res.body.length == 5) {
                    done();
                } else {
                    done(new Error('Cannot find repeated events'));
                }
            }, function (res) {
                done(new Error(res.body.message));
            });
        }, function (res) {
            done(new Error(res.body.message));
        });
    });
});