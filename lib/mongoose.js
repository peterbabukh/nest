https://gist.github.com/mongolab-org/9959376
// heroku config:set NODE_ENV="production"
// https://devcenter.heroku.com/articles/getting-started-with-nodejs#setting-node-env

var config = require('../config');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');

/*
* Mongoose by default sets the auto_reconnect option to true.
* We recommend setting socket options at both the server and replica set level.
* We recommend a 30 second connection timeout because it allows for
* plenty of time in most operating environments.
*/
var options = { 
	server: { 
		socketOptions: { 
			keepAlive: 1, 
			connectTimeoutMS: 30000 
		},
		auto_reconnect: true
	},
	replset: { 
		socketOptions: { 
			keepAlive: 1, 
			connectTimeoutMS : 30000 
		} 
	} 
};
/*
* Mongoose uses a different connection string format than MongoDB's standard.
* Use the mongodb-uri library to help you convert from the standard format to
* Mongoose's format.
*/
//var mongodbUri = 'mongodb://user:pass@host:port/db';
var mongodbUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  config.get('mongoose:uri');
  
var mongooseUri = uriUtil.formatMongoose(mongodbUri);

mongoose.connect(mongooseUri, options);

module.exports = mongoose;