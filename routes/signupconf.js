var User = require('../models/User').User;
var TempUser = require('../models/TempUser').User;
var i18n = require('i18next');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var flash = require('express-flash');

exports.get = function(req, res) {

	TempUser.findOne({
		token: req.params.token,
		validityTime: { $gt: new Date().getTime() }

	}, function(err, tempUser) {
		if (err) return next(err);

		if (!tempUser) {
			req.flash('error', i18n.t('text.invalidToken') );
			return res.redirect('back');
		}

		// finds a user in Mongo with provided email
		User.findOne({'email': tempUser.email}, function(err, user) {
			// In case of any error return
			if (err) return next(err);

			// such user already exists
			if (user) {
				req.flash('error', i18n.t('text.suchUserExists'));
				return res.render('signup');
			}

			// if there is no user with that email,
			// creates the new user
			var newUser = new User();

			// set the user's local credentials
			newUser.email = tempUser.email;
			newUser.salt = tempUser.salt;
			newUser.hashedPassword = tempUser.hashedPassword;

			// saves the user
			newUser.save(function(err) {
				if (err) return next(err);

				// removes the tempUser from db
				TempUser.remove({'_id': tempUser._id}, function (err) {
					if (err) next(err);

					// sends email notification on successful registration via mailgun.
					// sends email with further password reset instructions
					// This is the API key that you retrieve from www.mailgun.com
					var auth = {
						auth: {
							api_key: 'key-7a7bac10c61cd20aded2192fbbd65232',
							domain: 'sandbox3c18cfecd88743599362df5d8b3d25fc.mailgun.org'
						}
					};

					// uses nodemailer
					var nodemailerMailgun = nodemailer.createTransport(mg(auth));

					nodemailerMailgun.sendMail({
						from: 'mailgun@sandbox3c18cfecd88743599362df5d8b3d25fc.mailgun.org',
						to: newUser.email, // An array if you have multiple recipients.
						subject: i18n.t('text.registrationCompleted'),
						text: i18n.t('text.registrationCompletedSuccessfully')
					}, function (err) {
						if (err) {
							return next(err);
						}

						req.session.user = newUser;
						res.redirect('/home');

					});
				});
			});
		});
	});
};
