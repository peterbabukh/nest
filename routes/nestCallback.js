var passport = require('passport');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

exports.get = passport.authenticate('nest', {
        failureRedirect: '/home',
        failureFlash : true
    });
