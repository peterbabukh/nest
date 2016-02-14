module.exports = function(req, res, next) {
	if (req.url == '/favicon.ico') return res.end(''); //stop '/favicon.ico' request
	next();
};
