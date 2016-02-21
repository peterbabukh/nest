var express = require('express');
var routes = require('./routes');
var i18n = require('i18next');

var app = express();

i18n.init({
    debug: process.env.NODE_ENV == 'development',
    preload: ['ru', 'en', 'be'],
    supportedLngs: ['ru', 'en', 'be'],
    detectLngFromPath: false,
    ignoreRoutes: [],
    lng: process.env.NODE_LANG || 'en',
    saveMissing:   false,
    sendMissingTo: 'en'
});
app.use(i18n.handle);
// Registers AppHelper so you can use the translate function inside template
i18n.registerAppHelper(app)
    // grab i18next.js in browser to serve clientscript
    .serveClientScript(app)
    // route which returns all resources in on response
    .serveDynamicResources(app)
    // route to send missing keys
    .serveMissingKeyRoute(app);
/*
// i18next-webtranslate
//depends on following routes
i18n.serveChangeKeyRoute(app)
    .serveRemoveKeyRoute(app);

i18n.serveWebTranslate(app, {
    i18nextWTOptions: {
        languages: ['ru', 'en'],
        namespaces: ['ns.common', 'ns.special'],
        resGetPath: "locales/resources.json?lng=__lng__&ns=__ns__",
        resChangePath: 'locales/change/__lng__/__ns__',
        resRemovePath: 'locales/remove/__lng__/__ns__',
        fallbackLng: "ru",
        dynamicLoad: true
    }
});
*/

// register var t in locals to be used as ->> <%= t('hello.world') %>
app.locals.t = function(key){
    return i18n.t(key);
};


// add express modules and passportjs
require('./boot')(app);

// set routes
app.use(routes);

// define error handlers
app.use(require('./error/sendHttpError'));
app.use(require('./error/errorHandler')(app));


module.exports = app;