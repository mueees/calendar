var Q = require('q');

function asyncReject1() {
    var def = Q.defer();

    console.log('Execute asyncReject 1');

    def.reject('asyncReject1');

    return def.promise;
}

function asyncReject2() {
    var def = Q.defer();

    console.log('Execute asyncReject 2');

    def.reject('asyncReject2');

    return def.promise;
}

function asyncResolve() {
    var def = Q.defer();

    def.resolve('asyncResolve');

    return def.promise;
}

function fn() {
    var def = Q.defer();

    asyncReject().then(function (data) {
        asyncResolve.then(function () {
            def.resolve(data);
        }, function (err) {
            def.reject(err);
        });
    }, function (err) {
        def.reject(err);
    });

    return def.promise;
}

function fn1() {
    var def = Q.defer();

    asyncReject1()
        .then(asyncReject2)
        .fail(function (error) {
            def.reject(error);
    });

    return def.promise;
}

fn1().then(function (data) {
    console.log(data);
}, function (err) {
    console.log(err);
});