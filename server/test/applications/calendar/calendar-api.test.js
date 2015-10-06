var CalendarRequest = require('common/request/calendar'),
    Calendar = require('applications/calendar/common/resources/calendar'),
    Q = require('q'),
    log = require('common/log')(module),
    calendarConfig = require('applications/calendar/config');

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
    userId = '559bfe2016bd17920826b366';


describe('calendar-api', function () {
    before(function (done) {
        // database connection
        require("common/mongooseConnect").initConnection(calendarConfig).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        Calendar.remove(done);
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
        var newTitle = 'Test title';

        CalendarRequest.createEvent(event, userId).then(function (res) {
            CalendarRequest.editEvent({
                _id: res.body._id,
                title: newTitle
            }, userId).then(function (res) {
                if (res.body.title == newTitle) {
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
                    done(new Error(res.body.message));
                });
            }, function (res) {
                done(new Error(res.body.message));
            });
        });

    });
});