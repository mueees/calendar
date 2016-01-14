var _ = require('lodash'),
    log = require('common/log')(module),
    async = require('async'),
    Error = require('../../../../../common/resources/error'),
    Q = require('q');

module.exports.handle = function (error) {
    var def = Q.defer();

    Error.create(error, function (err, error) {
        if (err) {
            log.error(err);

            return def.reject('Cannot save error');
        }

        def.resolve(error);
    });

    return def.promise;
};