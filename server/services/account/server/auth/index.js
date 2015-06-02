var passport = require('passport'),
    User = require('common/resources/user'),
    BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
    function(token, done) {
        User.getUserByAccountToken(token, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));