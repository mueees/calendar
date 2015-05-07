var controller = {
    signUp: function (request, response, next) {
        response.render('index', {
            user: request.user || false
        });
    }
};

module.exports = controller;