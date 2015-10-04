var Application = require('common/resources/application'),
    log = require('common/log')(module),
    HttpError = require('common/errors/HttpError');

module.exports = function (app) {
    // create application
    app.put('/api/oauth/applications', function (request, response, next) {
        var data = request.body;

        if (!data.name || !data.name.length) {
            return next(new HttpError(400, 'Name should exist'));
        }

        if (!data.userId || !data.userId.length) {
            return next(new HttpError(400, "User Id should exists."));
        }

        if (!data.useProxy && !data.redirectUrl) {
            return next(new HttpError(400, "Redirect url should exists."));
        }

        Application.create(data, function (err, application) {
            if (err) {
                return next(new HttpError(400, err));
            }

            response.send({
                _id: application._id,
                name: application.name,
                applicationId: application.applicationId,
                privateKey: application.privateKey,
                oauthKey: application.oauthKey,
                date_create: application.date_create,
                description: application.description
            });
        });
    });

    // edit application
    app.post('/api/oauth/applications/:id', function (request, response, next) {
        var data = request.body;

        Application.update({
            _id: request.params.id
        }, data, function (err, application) {
            if (err) {
                log.error(err);
                return next(new HttpError(400, 'Server error'));
            }

            response.send(application);
        });
    });

    // get all applications
    app.get('/api/oauth/applications', function (request, response, next) {
        if (!request.query.userId) {
            return next(new HttpError(400, 'Invalid user Id'));
        }

        Application.find({
            userId: request.query.userId
        }, {
            _id: true,
            applicationId: true,
            date_create: true,
            description: true,
            domain: true,
            oauthKey: true,
            name: true,
            privateKey: true,
            useProxy: true,
            redirectUrl: true,
            status: true
        }, function (err, applications) {
            if (err) {
                log.error(err.message);
                return next(new HttpError(400, 'Server Error'));
            }

            response.send(applications);
        });
    });
};