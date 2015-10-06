var Calendar = require('../../../common/resources/calendar'),
    log = require('common/log')(module),
    async = require('async'),
    HttpError = require('common/errors/HttpError');

var prefix = '/api/calendar';

module.exports = function (app) {

    // create calendar
    app.put(prefix + '/calendar', function (request, response, next) {
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

            response.send(null, {
                _id: calendar._id
            });
        });
    });
};