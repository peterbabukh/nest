var passport = require('passport');

exports.get = function(req, res){
    res.render('register');
};

exports.post = passport.authenticate('signup', {
    successRedirect: '/signup',
    failureRedirect: '/signup',
    failureFlash : true
});

