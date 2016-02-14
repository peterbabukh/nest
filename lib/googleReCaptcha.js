var SECRET = "6Ld6vBQTAAAAAGP4NNvMG_kSHoHPo7Hbdfc0BWqP";
var https = require('https');

// Helper function to make API call to recaptcha and check response
module.exports = function(key, callback) {
    https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
        var data = "";
        res.on('data', function (chunk) {
            data += chunk.toString();
        });
        res.on('end', function() {
            try {
                var parsedData = JSON.parse(data);
                callback(parsedData.success);
            } catch (e) {
                callback(false);
            }
        });
    });
};
