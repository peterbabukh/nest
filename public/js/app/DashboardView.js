define( function(require) {

    'use strict';

    var Backbone = require('backbone');
    var i18n = require('i18n!../../js/nls/locales');
    var dashboardTmpl = require('text!../../templates/dashboardTmpl.html');


    var Dashboard = Backbone.View.extend({

        template: _.template( dashboardTmpl ),

        events: {

        },

        initialize: function() {
            this.childViews = [];
        },

        render: function() {
            this.onClose();
			this.$el.html( this.template( i18n ) );
			return this;
        },

        // Removes children views and their children views from DOM and thus prevents memory leaks
        onClose: function() {
            _.each( this.childViews, function(view){
                if (view && view.close) {
                    view.close();
                }
            });
            this.childViews.length = 0;
        }

    });

    return Dashboard;

});