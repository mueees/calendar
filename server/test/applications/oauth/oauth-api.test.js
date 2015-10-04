var OauthRequest = require('common/request/oauth'),
    Application = require('common/resources/application'),
    Q = require('q'),
    oauthConfig = require('applications/oauth-server/config');

describe('oauth-api', function () {
    var testApplication = {
        name: "REST REQUEST",
        userId: '559bfe2016bd17920826b366',
        useProxy: true
    };

    before(function (done) {
        // database connection
        require("common/mongooseConnect").initConnection(oauthConfig).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        Application.remove(done);
    });

    it('should create application', function (done) {
        OauthRequest.createApplication(testApplication).then(function (data) {
            if (!data._id) {
                done();
            } else {
                done(new Error('Cannot get application _id'));
            }
        }, function (err) {
            done(new Error(err.message));
        });
    });

    it('should edit application', function (done) {
        var newName = 'Test 2';

        OauthRequest.createApplication(testApplication).then(function (data) {
            OauthRequest.editApplication({
                _id: data.body._id,
                name: newName
            }).then(function () {
                done();
            }, function (reponse) {
                done(new Error(reponse.body.message));
            });

        }, function (err) {
            done(new Error(err.message));
        });
    });

    it('should return all applications', function (done) {
        var firstApp = {
                name: "First",
                userId: '559bfe2016bd17920826b366',
                useProxy: true
            },
            secondApp = {
                name: "Second",
                userId: '559bfe2016bd17920826b366',
                useProxy: true
            };

        Q.all([
            OauthRequest.createApplication(firstApp),
            OauthRequest.createApplication(secondApp)
        ]).then(function () {
            OauthRequest.getApplications({
                userId: firstApp.userId
            }).then(function (data) {
                if (data.body.length == 2) {
                    done();
                } else {
                    done(new Error('Wrong applications length'));
                }
            }, function (response) {
                done(new Error(response.body.message));
            });
        }, function (err) {
            done(new Error(err));
        });
    });
});