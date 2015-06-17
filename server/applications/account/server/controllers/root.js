var controller = {
    home: function (request, response, next) {
        response.render('pages/home', {
            user: request.user || false
        });
    }
};

module.exports = controller;