var passport = require('passport'),
    Token = require('../../../common/resources/token'),
    BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
    function (client_token, done) {
        Token.findOne({
            client_token: client_token
        }, function (err, token) {
            if (err) {
                return done(err);
            }

            if (!token) {
                return done(null, false);
            }

            return done(null, token);
        });
    }
));