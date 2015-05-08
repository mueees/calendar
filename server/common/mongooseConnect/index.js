var mongoose = require('mongoose');

exports.initConnection = function (config) {
    mongoose.connect('mongodb://' + config.get('db:ip') + '/' + config.get('db:nameDatabase'));

    mongoose.connection.on('error', function (err) {
        console.log(err);
    });

    mongoose.connection.on('open', function () {
        console.log('Establish connect to mongodb, database: ' + config.get('db:nameDatabase'));
    });
};