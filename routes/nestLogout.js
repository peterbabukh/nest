var https = require('https');

exports.get = function(req, res) {
    var token = req.cookies['nest_token'];
    if (token) {
        var reqOpts = {
            hostname: 'api.home.nest.com',
            path: '/oauth2/access_tokens/' + token,
            method: 'DELETE'
        };

        https.request(reqOpts, function(revokeRes) {

            res.clearCookie('nest_token');
            return res.redirect('/home');

        }).on('error', function() {

            res.send('Log out failed. Please try again.');
        }).end();
    } else {

        res.redirect('/home');
    }
};

