var User = require('common/resources/user'),
    Q = require("q"),
    configuration = require("configuration"),
    dbConnect = require("common/mongooseConnect"),
    oauthConfig = require('applications/oauth-server/config'),
    accountConfig = require('applications/account/server/config'),
    OauthRequest = require('common/request/oauth');

var user = {
    email: 'mue.miv@gmail.com',
    password: 123123
};

var application = {
    applicationId: configuration.get('whiteAppList')[0],
    name: "Mue application",
    useProxy: true
};

function createUser() {
    var defer = Q.defer();

    dbConnect.initConnection(accountConfig).then(function () {
        User.signup(user.email, user.password, function (err, user) {
            if (err) {
                console.log(err);
                return;
            }

            application.userId = user._id;

            user.status = 200;
            user.confirmationId = '';
            user.date_confirm = new Date();

            user.save(function (err) {
                if (err) {
                    console.log(err);
                    return;
                }

                console.log('User ' + user.email + ' was saved');
                dbConnect.closeConnection();

                defer.resolve();
            });
        });
    });

    return defer.promise;
}

function createApplication() {
    dbConnect.initConnection(oauthConfig).then(function () {
        OauthRequest.createApplication(application).then(function (data) {
            console.log('Application was created');
            process.exit();
        });
    });
}

createUser().then(createApplication);





