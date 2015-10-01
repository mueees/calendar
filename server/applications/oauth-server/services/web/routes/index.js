module.exports = function (app) {
    app.post('/api/application/create', function (request, response, next) {
        response.send({
            _id: 'some fake api'
        });
    });
};