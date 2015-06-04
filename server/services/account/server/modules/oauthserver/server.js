var validator = require('validator'),
    Permission = require('common/resources/permission'),
    Application = require('common/resources/application'),
    async = require('async');

function Server(){}

Server.prototype.auth = function (request, response, next) {
    var data = request.body,
        me = this;

    if (!validator.isLength(data.applicationId, 1)) {
        return me.processError(400, "Invalid application Id", next);
    }

    async.waterfall([
        function (cb) {
            Application.find({
                _id: data.applicationId
            }, function (err, application) {
                if(err){
                    return cb('Server error');
                }

                if(!application){
                    return cb('Cannot find application');
                }

                if(application.status == 400){
                    return cb('Application was blocked');
                }

                cb(null, application);
            });
        },
        function (application, cb) {
            Permission.remove({
                userId: request.user._id
            }, function (err) {
                if(err){
                    return cb('Server error');
                }

                cb(null, application);
            });
        },
        function (application, cb) {
            Permission.create({
                userId: request.user._id,
                applicationId: application._id
            }, function (err, permission) {
                if(err){
                    return cb('Server error');
                }

                cb(null, permission);
            });
        }
    ], function (err, permission) {
        if(err){
            return me.processError(400, err, next);
        }

        response.send({
            ticket: permission.ticket
        });
    });
};

Server.prototype.exchange = function (request, response, next) {

};
Server.prototype.refresh = function (request, response, next) {};

module.exports = Server;