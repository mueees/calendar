var controller = {
    signUp: function (request, response, next) {
        response.render('pages/signUp', {
            user: request.user || false
        });
    }
};

module.exports = controller;