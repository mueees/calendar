var AccountRequest = require('common/request/account'),
    User = require('common/resources/user'),
    Q = require('q'),
    accountConfig = require('applications/account/server/config');

var testUser = {
    email: 'test@gmail.com',
    passwords: '123123'
};

function createUser() {
    var def = Q.defer();

    User.signup(testUser.email, testUser.password, function (err, user) {
        if (err) {
            return def.reject();
        }

        def.resolve(user);
    });

    return def.promise;
}

describe('account-api', function () {
    before(function (done) {
        // database connection
        require("common/mongooseConnect").initConnection(accountConfig).then(function () {
            done();
        });
    });

    after(function (done) {
        require("common/mongooseConnect").closeConnection();
        done();
    });

    afterEach(function (done) {
        User.remove(done);
    });

    it('should get user info', function (done) {
        createUser().then(function (user) {
            AccountRequest.getUser({
                userId: user._id
            }).then(function (res) {
                if (res.body.email) {
                    done();
                } else {
                    done(new Error('Cannot get user info'))
                }
            }, function (res) {
                done(new Error(res.body.message));
            });
        }, function () {
            done(new Error('Cannot create user'));
        });
    });
});