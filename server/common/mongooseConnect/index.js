var mongoose = require('mongoose'),
    Q = require('q');

exports.closeConnection = function () {
    mongoose.connection.close()
};

exports.initConnection = function (config) {
    var def = Q.defer();
    mongoose.connect('mongodb://' + config.get('db:ip') + '/' + config.get('db:nameDatabase'));

    mongoose.connection.on('error', function (err) {
        console.log(err);
        def.reject();
    });

    mongoose.connection.on('open', function () {
        console.log('Establish connect to mongodb, database: ' + config.get('db:nameDatabase'));
        def.resolve();
    });

    return def.promise;
};