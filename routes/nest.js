var passport = require('passport');

exports.get = passport.authenticate('nest', {
    failureRedirect: '/home',
    failureFlash : true
});
