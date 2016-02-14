var User = require('../models/User').User;
var i18n = require('i18next');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var flash = require('express-flash');
var googleReCaptcha = require('../lib/googleReCaptcha');

exports.get = function(req, res) {

	// if the token and password change period are valid, renders the password reset page.
	// Else - redirects to password forgot page
	User.findOne({

		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: new Date().getTime() }

	}, function(err, user) {
		if (err) return next(err);

		if (!user) {
			req.flash('error', i18n.t('text.invalidToken') );
			return res.render('forgot');
		}

		res.render('reset');

	});
};


exports.post = function(req, res) {

	// checks googleReCaptcha
	googleReCaptcha(req.body["g-recaptcha-response"], function(success) {
		if (!success) {

			req.flash('error', i18n.t('text.invalidRecaptcha') );
			return res.render('reset');

		} else if ( req.body.password !== req.body.confirmPassword ) {
			// returns if passwords do not match
			req.flash('error', i18n.t('text.passwordsNotMatch') );
			return res.render('reset');

		} else {
			// checks if the user with this reset token exists
			User.findOne({

				resetPasswordToken: req.params.token,
				resetPasswordExpires: { $gt: new Date().getTime() }
			}, function(err, user) {
				if (err) return next(err);

				if (!user) {
					req.flash('error', i18n.t('text.invalidToken') );
					return res.redirect('back');
				}

				user.salt = Math.random() + '';
				user.hashedPassword = user.encryptPassword( req.body.password );
				user.resetPasswordToken = '';
				user.resetPasswordExpires = 0;

				user.save(function(err) {
					if (err) return next(err);

					// sends email notification on password change via mailgun and nodemailer.
					// sends email with further password reset instructions
					// This is the API key that you retrieve from www.mailgun.com
					var auth = {
						auth: {
							api_key: 'key-7a7bac10c61cd20aded2192fbbd65232',
							domain: 'sandbox3c18cfecd88743599362df5d8b3d25fc.mailgun.org'
						}
					};

					var nodemailerMailgun = nodemailer.createTransport(mg(auth));

					nodemailerMailgun.sendMail({

						from: 'mailgun@sandbox3c18cfecd88743599362df5d8b3d25fc.mailgun.org',
						to: user.email, // An array if you have multiple recipients.
						subject: i18n.t('text.passwordReset'),
						text: i18n.t( 'text.passwordChangeNotification' )

					}, function (err) {
						if (err) return next(err);

						req.session.user = user;
						res.redirect('/home');

					});
				});
			});
		}
	});
};