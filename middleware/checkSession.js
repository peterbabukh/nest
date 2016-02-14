var User = require('../models/User').User;

module.exports = function(req, res, next) {

    if (req.session && req.session.user) {

        User.findOne({ '_id': req.session.user._id }, function(err, user) {
            if (err) return console.log(err);

            if (user) {
                req.user = user;
                // delete the password from the session
                delete req.user.password;
                //refresh the session value

                req.session.user = user;
            }

            next();
        });
    } else {
        next();
    }

};