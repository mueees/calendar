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

    it('should delete application', function (done) {
        OauthRequest.createApplication(testApplication).then(function (data) {
            OauthRequest.deleteApplication({
                _id: data.body._id
            }).then(function () {
                done();
            }, function (response) {
                done(new Error(response.body));
            });
        }, function (response) {
            done(new Error(response.body.message));
        });
    });

    it('should create permission and return ticket', function (done) {
        OauthRequest.createApplication(testApplication).then(function (data) {
            OauthRequest.auth({
                userId: testApplication.userId,
                applicationId: data.body.applicationId
            }).then(function (data) {
                if (data.body) {
                    done();
                } else {
                    done(new Error('Something wrong'));
                }
            }, function (response) {
                done(new Error(response.body.message));
            });
        }, function (response) {
            done(new Error(response.body.message));
        });
    });

    it('should exchange ticket to access and refresh token', function (done) {
        var application = null;

        OauthRequest.createApplication(testApplication).then(function (data) {
            application = data.body;

            OauthRequest.auth({
                userId: testApplication.userId,
                applicationId: application.applicationId
            }).then(function (data) {
                OauthRequest.exchange({
                    ticket: data.body,
                    privateKey: application.privateKey,
                    applicationId: application.applicationId
                }).then(function (data) {
                    if (data.body.access_token) {
                        done();
                    } else {
                        done(new Error('Cannot exchange ticket to access token'));
                    }
                }, function (response) {
                    done(new Error(response.body.message));
                })
            }, function (response) {
                done(new Error(response.body.message));
            });
        }, function (response) {
            done(new Error(response.body.message));
        });
    });

    it('should refresh access token by refresh token', function (done) {
        var application = null;

        OauthRequest.createApplication(testApplication).then(function (data) {
            application = data.body;

            OauthRequest.auth({
                userId: testApplication.userId,
                applicationId: application.applicationId
            }).then(function (data) {
                OauthRequest.exchange({
                    ticket: data.body,
                    privateKey: application.privateKey,
                    applicationId: application.applicationId
                }).then(function (data) {
                    OauthRequest.refresh({
                        privateKey: application.privateKey,
                        refresh_token: data.body.refresh_token,
                        applicationId: application.applicationId
                    }).then(function (data) {
                        if (data.body.access_token) {
                            done();
                        } else {
                            done(new Error('Cannot refresh access token'));
                        }
                    });
                }, function (response) {
                    done(new Error(response.body.message));
                })
            }, function (response) {
                done(new Error(response.body.message));
            });
        }, function (response) {
            done(new Error(response.body.message));
        });
    });

    it('should generate new private key', function (done) {
        OauthRequest.createApplication(testApplication).then(function (data) {
            OauthRequest.newPrivateKey({
                _id: data.body.applicationId
            }).then(function (data) {
                if (data.body) {
                    done();
                } else {
                    done(new Error('Cannot generate new private key'));
                }
            }, function (response) {
                done(new Error(response.body.message));
            })
        }, function (response) {
            done(new Error(response.body.message));
        });
    });

    it('should get permission by access token', function (done) {
        var application = null;

        OauthRequest.createApplication(testApplication).then(function (data) {
            application = data.body;

            OauthRequest.auth({
                userId: testApplication.userId,
                applicationId: application.applicationId
            }).then(function (data) {
                OauthRequest.exchange({
                    ticket: data.body,
                    privateKey: application.privateKey,
                    applicationId: application.applicationId
                }).then(function (data) {
                    OauthRequest.getPermissionByAccessToken(data.body.access_token).then(function (data) {
                        if (data.body.access_token) {
                            done();
                        } else {
                            done(new Error('Cannot get permission by access token'));
                        }
                    }, function (response) {
                        done(new Error(response.body.message));
                    });
                }, function (response) {
                    done(new Error(response.body.message));
                })
            }, function (response) {
                done(new Error(response.body.message));
            });
        }, function (response) {
            done(new Error(response.body.message));
        });
    });
});