var User = require('../models/User').User;
var crypto = require('crypto');
var i18n = require('i18next');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var flash = require('express-flash');
var googleReCaptcha = require('../lib/googleReCaptcha');

exports.get = function(req, res) {
	res.render('forgot');
};


exports.post = function(req, res, next) {

	// checks googleReCaptcha
	googleReCaptcha(req.body["g-recaptcha-response"], function(success) {
		if (!success) {

			req.flash('error', i18n.t('text.invalidRecaptcha') );
			return res.render('forgot');

		} else {

			// creates token
			crypto.randomBytes(20, function (err, buf) {
				if (err) return next(err);

				var token = buf.toString('hex');

				// checks if account with such email exists
				User.findOne({email: req.body.email}, function (err, user) {
					if (err) return next(err);

					if (!user) {
						req.flash('error', i18n.t('text.noSuchEmailAccount'));
						return res.render('forgot');
					}

					// saves the reset token and specifies 1 hour period to reset password
					user.resetPasswordToken = token;
					user.resetPasswordExpires = new Date().getTime() + 3600000; // 1 hour

					user.save(function (err) {
						if (err) return next(err);

						// sends email with further password reset instructions via mailgun and nodemailer
						// This is the API key that you retrieve from www.mailgun.com
						var auth = {
							auth: {
								api_key: 'api_key',
								domain: 'domain'
							}
						};

						var nodemailerMailgun = nodemailer.createTransport(mg(auth));

						nodemailerMailgun.sendMail({

							from: 'from',
							to: user.email, // An array if you have multiple recipients.
							subject: i18n.t('text.passwordReset'),
							html: i18n.t( 'text.passwordForgotInstructions1' ) + '<br /><br />' +
							'<a href=\"http://' + req.headers.host + '/reset/' + token + '\">' +
							'http://' + req.headers.host + '/reset/' + token + '</a><br /><br />' +
							i18n.t( 'text.passwordForgotInstructions2' )

						}, function (err) {
							if (err) next(err);

							req.flash('info', i18n.t('text.emailSentTo') + user.email +
								i18n.t('text.emailSentTo2') ) ;
							res.redirect('/forgot');

						});
					});
				});
			});
		}
	});
};
