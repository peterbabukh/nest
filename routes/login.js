var passport = require('passport');

exports.get = function(req, res) {
    res.render('login');
};

exports.post = passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash : true
});
