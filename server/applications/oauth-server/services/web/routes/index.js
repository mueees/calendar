var Application = require('common/resources/application'),
    HttpError = require('common/errors/HttpError');

module.exports = function (app) {
    app.put('/api/oauth/application', function (request, response, next) {
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

    app.post('/api/oauth/application', function (request, response, next) {
        response.send({});
    });
};