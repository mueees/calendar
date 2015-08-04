var Client = require('common/service').Client,
    _ = require('underscore'),
    log = require('common/log')(module),
    async = require('async'),
    moment = require('moment'),
    Calendar = require('../../../applications/calendar/common/resources/calendar'),
    Event = require('../../../applications/calendar/common/resources/event'),
    configuration = require('configuration');

require('applications/calendar/services/api');

var mockUseId = '559c00051f9eaee6089e6009',
    mockCalendarId = '559c00051f9eaee6089e6010';

describe('calendar-api', function () {
    var client = null;

    before(function (done) {
        client = new Client({
            port: configuration.get('applications-api:calendar:port')
        });

        client.on('remote', done);
    });

    afterEach(function (done) {
        async.parallel([
            function (cb) {
                Calendar.remove(cb);
            },
            function (cb) {
                Event.remove(cb);
            }
        ], function (err) {
            if (err) {
                return done(new Error())
            }

            done();
        });
    });

    it('should retrieve version in right format', function (done) {
        client.exec('request', '/version', function (err, data) {
            if (err) {
                done('err');
            }

            if (_.isNumber(data.version)) {
                done();
            } else {
                done(new Error("Version is not in correct format"));
            }
        });
    });

    it('should Throw error when data is empty', function (done) {
        client.exec('request', '/calendar/create', {
            data: {},
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                done();
            }
        });
    });

    it('should create calendar', function (done) {
        client.exec('request', '/calendar/create', {
            data: {
                name: 'test',
                description: 'description'
            },
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                done('Some error');
            }

            if (data._id) {
                done();
            } else {
                done(new Error('Something wrong with calendar creation'));
            }
        });
    });

    it('should edit calendar', function (done) {
        var newName = 'newName',
            active = false;

        client.exec('request', '/calendar/create', {
            data: {
                name: 'test',
                description: 'description'
            },
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/calendar/edit', {
                data: {
                    name: newName,
                    active: active,
                    fakeField: 'fakeField',
                    _id: data._id
                },
                userId: mockUseId
            }, function (err, calendar) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (calendar.name == newName && calendar.active == active && !calendar.fakeField) {
                    done();
                } else {
                    done(new Error('Something wrong with calendar edition'));
                }
            });
        });
    });

    it('should list all calendar for specific UserId', function (done) {
        client.exec('request', '/calendar/create', {
            data: {
                name: 'test2',
                description: 'description'
            },
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                done('Some error');
            }


            client.exec('request', '/calendar/all', {
                userId: mockUseId
            }, function (err, data) {
                if (err) {
                    done('Some error');
                }

                if (_.some(data, 'name', 'test2')) {
                    done();
                } else {
                    done(new Error('Something wrong with fetching all calendars'));
                }
            });
        });
    });

    it('should get a specific calendar by id', function (done) {
        client.exec('request', '/calendar/create', {
            data: {
                name: 'test3',
                description: 'description'
            },
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                done('Some error');
            }

            var test3Id = data._id;

            client.exec('request', '/calendar/get/' + test3Id, {
                userId: mockUseId
            }, function (err, data) {
                if (err) {
                    done('Some error');
                }

                if (data.name == 'test3') {
                    done();
                } else {
                    done(new Error('Something wrong with fetching specific calendar'));
                }
            });
        });
    });

    it('should delete a specific calendar by id', function (done) {
        client.exec('request', '/calendar/create', {
            data: {
                name: 'test4',
                description: 'description'
            },
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                done('Some error');
            }

            var test4Id = data._id;

            client.exec('request', 'calendar/delete', {
                data: {
                    _id: test4Id
                },
                userId: mockUseId
            }, function (err, data) {
                if (err) {
                    done('Some error');
                }

                if (_.isEmpty(data)) {
                    done();
                } else {
                    done(new Error('Something wrong with deletion specific calendar'));
                }
            });
        });
    });

    it('should create an event in a calendar', function (done) {
        client.exec('request', '/calendar/create', {
            data: {
                name: 'testEvent',
                description: 'description'
            },
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                done('Some error');
            }

            var start = new Date(),
                end = start + 10000,
                test4Id = data._id;

            client.exec('request', '/event/create', {
                data: {
                    calendarId: test4Id,
                    title: 'TestEvent',
                    start: start,
                    end: end,
                    isAllDay: true,
                    isRepeat: false
                }
            }, function (err, data) {
                if (err) {
                    done(err);
                }

                if (data._id) {
                    done();
                } else {
                    done(new Error('Something wrong with creation of event'));
                }
            });
        });
    });

    it('should base edit an event in a calendar', function (done) {
        var newTitle = 'newTitle',
            isAllDay = false;

        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: new Date(),
                end: new Date(),
                isRepeat: false,
                calendarId: mockCalendarId,
                isAllDay: true
            }
        }, function (err, event) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/edit', {
                data: {
                    title: newTitle,
                    isAllDay: isAllDay,
                    _id: event._id
                }
            }, function (err, event) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (event.title == newTitle && event.isAllDay == isAllDay) {
                    return done();
                } else {
                    return done(new Error('Something wrong with edit method'));
                }
            });
        });
    });

    it('should add repeat data an event in a calendar', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: new Date(),
                end: new Date(),
                isRepeat: false,
                calendarId: mockCalendarId,
                isAllDay: true
            }
        }, function (err, event) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/edit', {
                data: {
                    isRepeat: true,
                    repeatType: 3,
                    repeatDays: [0, 4],
                    _id: event._id
                }
            }, function (err, event) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (event.isRepeat && event.repeatType == 3 && event.repeatDays) {
                    return done();
                } else {
                    return done(new Error('Something wrong with edit method'));
                }
            });
        });
    });

    it('should remove repeat data an event in a calendar', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: new Date(),
                end: new Date(),
                isRepeat: true,
                repeatType: 3,
                repeatDays: [0, 4],
                calendarId: mockCalendarId,
                isAllDay: true
            }
        }, function (err, event) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/edit', {
                data: {
                    isRepeat: false,
                    _id: event._id
                }
            }, function (err, event) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (!event.isRepeat && !event.repeatType && !event.repeatDays && !event.repeatEnd) {
                    return done();
                } else {
                    return done(new Error('Something wrong with edit method'));
                }
            });
        });
    });

    it('should delete an event in a calendar', function (done) {
        client.exec('request', '/calendar/create', {
            data: {
                name: 'testEvent',
                description: 'description'
            },
            userId: mockUseId
        }, function (err, data) {
            if (err) {
                done('Some error');
            }

            var start = new Date();
            var end = start + 10000;
            var test4Id = data._id;

            client.exec('request', '/event/create', {
                data: {
                    calendarId: test4Id,
                    title: 'TestEvent',
                    start: start,
                    end: end,
                    isAllDay: true,
                    isRepeat: false
                }
            }, function (err, data) {
                if (err) {
                    done(err);
                }

                var eventId = data._id;

                client.exec('request', '/event/delete', {
                    data: {
                        _id: eventId
                    }
                }, function (err, data) {
                    if (err) {
                        done('Some error');
                    }

                    if (_.isEmpty(data)) {
                        done();
                    } else {
                        done(new Error('Something wrong with deletion specific event'));
                    }
                });
            });
        });
    });

    it('should create few events, that no repeats, and find them', function (done) {
        var now = new Date(),
            methods = [],
            events = [
                {
                    title: 'TestEvent 1',
                    start: now,
                    end: now,
                    isRepeat: false,
                    calendarId: mockCalendarId,
                    isAllDay: true
                },
                {
                    title: 'TestEvent 2',
                    start: moment(new Date()).add(1, 'd').toDate(),
                    end: moment(new Date()).add(1, 'd').toDate(),
                    isRepeat: false,
                    calendarId: mockCalendarId,
                    isAllDay: true
                },
                {
                    title: 'TestEvent 3',
                    start: moment(new Date()).add(2, 'd').toDate(),
                    end: moment(new Date()).add(2, 'd').toDate(),
                    isRepeat: false,
                    calendarId: mockCalendarId,
                    isAllDay: true
                },
                {
                    title: 'TestEvent 4',
                    start: moment(new Date()).add(3, 'd').toDate(),
                    end: moment(new Date()).add(3, 'd').toDate(),
                    isRepeat: false,
                    calendarId: mockCalendarId,
                    isAllDay: true
                }
            ];

        _.each(events, function (event) {
            methods.push(function (cb) {
                client.exec('request', '/event/create', {
                    data: event,
                    userId: mockUseId
                }, cb);
            });
        });

        async.parallel(methods, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment(new Date()).toDate(),
                    end: moment(new Date()).add(2, 'd').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 3) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            })
        });
    });

    it('should create event that repeat every day without end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: new Date(),
                end: new Date(),
                isRepeat: true,
                repeatType: 1,
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment(new Date()).add(1, 'd').toDate(),
                    end: moment(new Date()).add(5, 'd').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 5) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            })
        })
    });

    it('should create event and  dont find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: new Date(),
                end: new Date(),
                isRepeat: true,
                repeatType: 1,
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment(new Date()).add(1, 'd').toDate(),
                    end: moment(new Date()).add(5, 'd').toDate(),
                    calendarIds: ['559c00051f9eaee6089e6089']
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 0) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            })
        })
    });

    it('should create event that repeat every day with end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: new Date(),
                end: new Date(),
                isRepeat: true,
                repeatType: 1,
                repeatEnd: moment(new Date()).add(2, 'd').toDate(),
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment(new Date()).toDate(),
                    end: moment(new Date()).add(5, 'd').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 3) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should create event that repeat every day with end and do not find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment(new Date()).add(3, 'd').toDate(),
                end: moment(new Date()).add(3, 'd').toDate(),
                isRepeat: true,
                repeatType: 1,
                repeatEnd: moment(new Date()).add(4, 'd').toDate(),
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment(new Date()).toDate(),
                    end: moment(new Date()).add(2, 'd').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 0) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should create event that repeat some days without end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment('2015-07-02').toDate(),
                end: moment('2015-07-02').toDate(),
                isRepeat: true,
                repeatType: 2,
                repeatDays: [0, 1],
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment('2015-07-12').toDate(),
                    end: moment('2015-07-18').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 2) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should create event that repeat some days with end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment('2015-07-02').toDate(),
                end: moment('2015-07-02').toDate(),
                isRepeat: true,
                repeatType: 2,
                repeatDays: [0, 1, 2, 3, 4, 5],
                repeatEnd: moment('2015-07-14').toDate(),
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment('2015-07-12').toDate(),
                    end: moment('2015-07-18').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 2) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should create event that repeat monthly without end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment('2015-07-02').toDate(),
                end: moment('2015-07-02').toDate(),
                isRepeat: true,
                repeatType: 3,
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment('2015-07-01').toDate(),
                    end: moment('2015-11-01').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 4) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should create event that repeat monthly with end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment('2015-07-02').toDate(),
                end: moment('2015-07-02').toDate(),
                isRepeat: true,
                repeatType: 3,
                repeatEnd: moment('2015-09-01').toDate(),
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment('2015-07-01').toDate(),
                    end: moment('2015-11-05').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 2) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should create event that repeat yearly without end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment('2015-07-02').toDate(),
                end: moment('2015-07-02').toDate(),
                isRepeat: true,
                repeatType: 4,
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment('2015-07-01').toDate(),
                    end: moment('2020-07-01').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 5) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should create event that repeat yearly with end and find them', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment('2015-07-02').toDate(),
                end: moment('2015-07-02').toDate(),
                isRepeat: true,
                repeatEnd: moment('2019-07-01').toDate(),
                repeatType: 4,
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment('2015-07-01').toDate(),
                    end: moment('2020-07-01').toDate(),
                    calendarIds: [mockCalendarId]
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events.length == 4) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });

    it('should return certain fields', function (done) {
        client.exec('request', '/event/create', {
            data: {
                title: 'TestEvent 1',
                start: moment('2015-07-02').toDate(),
                end: moment('2015-07-02').toDate(),
                isRepeat: true,
                repeatEnd: moment('2019-07-01').toDate(),
                repeatType: 4,
                calendarId: mockCalendarId,
                isAllDay: false
            }
        }, function (err) {
            if (err) {
                return done(new Error(err.message));
            }

            client.exec('request', '/event/find', {
                data: {
                    start: moment('2015-07-01').toDate(),
                    end: moment('2020-07-01').toDate(),
                    calendarIds: [mockCalendarId],
                    fields: ['title']
                }
            }, function (err, events) {
                if (err) {
                    return done(new Error(err.message));
                }

                if (events && events[0].title && events[0]._id  && !events[0].start) {
                    return done();
                } else {
                    return done(new Error('Something wrong with find method'));
                }
            });
        });
    });
});