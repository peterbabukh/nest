var express = require('express');
var config = require('../config');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');

module.exports = function (app) {

    app.use(favicon(__dirname + '/../dist/assets/img/favicon.ico'));

    // view engine setup
    app.engine('ejs', require('ejs-locals'));
    app.set('views', path.join(__dirname + '/..', 'views'));
    app.set('view engine', 'ejs');

    app.use(cookieParser());
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
    app.use(methodOverride());

    var sessionStore = require('../lib/sessionStore');
    app.use( session({
        secret: config.get('session:secret'),
        key: config.get('session:key'),
        cookie: config.get('session:cookie'),
        rolling: config.get('session:rolling'),
        resave: config.get('session:resave'),
        saveUninitialized: config.get('session:saveUninitialized'),
        store: sessionStore
    }));

    // files are passed not from public folder, but from dist folder,
    // already transpiled and minified by Grunt
    app.use(express.static(path.join(__dirname + '/..', 'dist')));

};