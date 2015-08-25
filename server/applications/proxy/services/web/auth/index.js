var passport = require('passport'),
    async = require('async'),
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
                OauthAccess.findOne({
                    _id: token.oauthAccessId
                }, cb);
            }
        ], function (err, oauthAccess) {
            if (err) {
                return done(err);
            }

            if (!oauthAccess) {
                return done(null, false);
            }

            return done(null, oauthAccess);
        });
    }
));