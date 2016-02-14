var User = require('../models/User').User;

exports.get = function(req, res) {

    if (req.session && req.session.user) {

        User.findOne({'_id': req.session.user._id}, function(err, user) {
            if (err) return console.log(err);

            if (!user) {
                // redirect to the login page
                req.session.destroy(function(err) {
                    if (err) return console.log(err);
                });

                res.redirect('/');

            } else {
                // render layout
                res.render('layout');
            }
        });

    } else {
        res.redirect('/');
    }

};