var MueRequest = require('./index'),
    app = 'calendar',
    service = 'api';

function createCalendar(data, userId) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'PUT',
        url: '/calendars',
        body: data,
        headers: {
            userid: userId
        }
    });
}

function createEvent(data, userId) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'PUT',
        url: '/events',
        body: data,
        headers: {
            userid: userId
        }
    });
}

function editEvent(data, userId) {
    var _id = data._id;

    delete data._id;

    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/events/' + _id,
        body: data,
        headers: {
            userid: userId
        }
    });
}

function editCalendar(data, userId) {
    var _id = data._id;

    delete data._id;

    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/calendars/' + _id,
        body: data,
        headers: {
            userid: userId
        }
    });
}

function deleteCalendar(id, userId) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'DELETE',
        url: '/calendars/' + id,
        headers: {
            userid: userId
        }
    });
}

function deleteEvent(id, userId) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'DELETE',
        url: '/events/' + id,
        headers: {
            userid: userId
        }
    });
}

function getEventById(id, userId) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/events/' + id,
        headers: {
            userid: userId
        }
    });
}

function getCalendars(data, userId){
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/calendars',
        body: data,
        headers: {
            userid: userId
        }
    });
}

exports.getEventById = getEventById;
exports.editEvent = editEvent;
exports.editCalendar = editCalendar;
exports.deleteEvent = deleteEvent;
exports.deleteCalendar = deleteCalendar;
exports.createEvent = createEvent;
exports.createCalendar = createCalendar;
exports.getCalendars = getCalendars;