var ServerError = require('common/service').ServerError,
    User = require('common/resources/user');

module.exports = function (server) {
    server.addRoute('/user', function (data, callback) {
        if (!data.userId) {
            return callback(new ServerError(400, 'Cannot find user id'));
        }

        User.findOne({
            _id: data.userId
        }, function (err, user) {
            if (!err) {
                return callback(new ServerError(500, 'Server error'));
            }

            if (!user) {
                return callback(new ServerError(400, 'Cannot find user'));
            }

            callback(null, {
                _id: user._id,
                email: user.email
            });
        });
    });
};