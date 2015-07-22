var Client = require('common/service').Client,
    _ = require('underscore'),
    log = require('common/log')(module),
    Calendar = require('../../../applications/calendar/common/resources/calendar');
    Event = require('../../../applications/calendar/common/resources/event');
    configuration = require('configuration');
require('applications/calendar/services/api');

var mockUseId = '559c00051f9eaee6089e6009';


describe('calendar-api', function () {
    var client = null;

    before(function (done) {
        client = new Client({
            port: configuration.get('applications-api:calendar:port')
        });

        client.on('remote', function () {
            done();
        });
    });

    after(function(done) {
        Calendar.remove().exec();
        Event.remove().exec();
        done();
    });

    it('should retreive version in right format', function (done) {
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

    it('should Tthrow error when data is empty', function (done) {
        client.exec('request', '/calendar/create', {
            data: {},
            userId: mockUseId
        }, function (err, data) {
            if (err) { done();}
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

            if(data._id){
                done();
            } else {
                done(new Error('Something wrong with calendar creation'));
            }
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

                if(_.some(data, 'name', 'test2')) {
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

                if(data.name == 'test3') {
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

                if(_.isEmpty(data)) {
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

            var startDate = new Date();
            var endDate = startDate + 10000;
            var test4Id = data._id;

            client.exec('request', '/event/create', {
                data: {
                    calendarId: test4Id,
                    title: 'TestEvent',
                    startDay: startDate,
                    endDay: endDate,
                    isAllDay: true,
                    isRepeat: false
                }
            }, function (err, data) {
                if (err) {
                    done(err);
                }

                if(data._id) {
                    done();
                } else {
                    done(new Error('Something wrong with creation of event'));
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

            var startDate = new Date();
            var endDate = startDate + 10000;
            var test4Id = data._id;

            client.exec('request', '/event/create', {
                data: {
                    calendarId: test4Id,
                    title: 'TestEvent',
                    startDay: startDate,
                    endDay: endDate,
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

                    if(_.isEmpty(data)) {
                        done();
                    } else {
                        done(new Error('Something wrong with deletion specific event'));
                    }
                });
            });
        });
    });
});
