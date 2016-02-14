var User = require('../models/User').User;

exports.get = function(req, res) {

    // remove the user
    User.remove({'_id': req.session.user._id}, function (err) {
        if (err) return next(err);

        req.session.destroy(function(err) {
            if (err) return next(err);

            return res.redirect('/');

        });
    });
};

