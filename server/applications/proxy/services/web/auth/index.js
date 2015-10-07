var passport = require('passport'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    Token = require('../../../common/resources/token'),
    OauthAccess = require('../../../common/resources/oauth-access'),
    BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
    function (client_token, done) {
        async.waterfall([
            function (cb) {
                Token.findOne({
                    client_token: client_token
                }, cb);
            }, function (token, cb) {
                if (!token) {
                    cb('Cannot find client token');
                } else {
                    OauthAccess.findOne({
                        _id: token.oauthAccessId
                    }, cb);
                }
            }
        ], function (err, oauthAccess) {
            if (err) {
                return done(new HttpError(401, err));
            }

            if (!oauthAccess) {
                return done(new HttpError(401, 'Cannot find access token'));
            }

            return done(null, oauthAccess);
        });
    }
));