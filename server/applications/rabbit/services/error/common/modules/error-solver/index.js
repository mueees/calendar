var Feed = require('../../../../../common/resources/feed'),
    Q = require('q'),
    feedManager = require('common/modules/feedManager'),
    log = require('common/log')(module);

function clearErrors(data) {

}

function solveError1(error) {
    var def = Q.defer();

    Feed.findOne({
        _id: error.data.feedId
    }, function (err, feed) {
        if (err) {
            log.error(err);

            return def.reject(err.message);
        }

        feedManager.loadPage({
            url: feed.url
        }).then(function () {
            clearErrors({
                errorCode: '1',
                feedId: error.data.feedId
            });
        }, function (err) {
            log.error(err);

            error.setForHuman();
        });
    });

    return def.promise;
}

var solvers = {
    1: solveError1
};

function solve(error) {
    var solverHandler = solvers[error.errorCode];

    return solverHandler(error);
}

module.exports = {
    solve: solve,
    solvers: solvers
};