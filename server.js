var http = require('http');
var app = require('./app.js');
var config = require('./config');
var log = require('./lib/log')(module);
var mongoose = require('./lib/mongoose');

var port = process.env.PORT || config.get('port');

// opens connection to the database
var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'Connection error: '));
conn.once('open', function callback () {

	// starts the app after the connection to db is opened
	var server = http.createServer(app);
	module.exports = server;
	server.listen(port, function(){
		log.info('Server listening on port ' + port);
	});


});

