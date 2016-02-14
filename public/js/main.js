require.config({

    baseUrl: './js/lib',

    paths: {
        'app': '../app',
        jquery: './jquery-2.1.4.min',
        backbone: './backbone-0.9.2',
        underscore: './underscore-1.4.2',
        i18n: '../i18n',
        text: './text-2.0.14'
    },

    shim: {
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        jquery: {
            exports: '$'
        },
        i18n: {
            deps: ['jquery']
        }
    }

});

require(['app/ApplicationController'], function(ApplicationController) {

    'use strict';

    var applicationController = new ApplicationController();

});