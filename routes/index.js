var express = require('express');
var passport = require('passport');
/**
 * No user data is available in the Nest OAuth
 * service, just return the empty user object.
 */
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});


var checkSession = require('../middleware/checkSession');
//var skipFavicon = require('../middleware/skipFavicon');

// middleware, checking if the user logged in
var requireLogin = require('../middleware/requireLogin');


var router = express.Router();

// skips Favicon requests
//router.use(skipFavicon);

// checks if session exists
router.use(checkSession);

// authorization routes
router.get('/', require('./login').get);
router.post('/login', require('./login').post);
router.get('/signup', require('./signup').get);
router.post('/signup', require('./signup').post);
router.get('/signupconf/:token', require('./signupconf').get);
router.get('/logout', require('./logout').get);
router.get('/signout', require('./signout').get);

// nest auth routes
router.get('/auth/nest', passport.authenticate('nest', {
    failureRedirect: '/'
}));

router.get('/auth/nest/callback', passport.authenticate('nest', {
        failureRedirect: '/'
    }), function(req, res) {
        res.cookie('nest_token', req.user.accessToken);
        res.redirect('/home');
});

router.get('/nest/logout', require('./nestLogout').get);


// forgot password routes
router.get('/forgot', require('./forgot').get);
router.post('/forgot', require('./forgot').post);
router.get('/reset/:token', require('./reset').get);
router.post('/reset/:token', require('./reset').post);

// page render routes
router.get('/home', requireLogin, require('./home').get);

router.get('*', function(req, res){
  res.redirect('/');
});


module.exports = router;