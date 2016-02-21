define( function(require) {

    'use strict';

    var Backbone = require('backbone');
    var i18n = require('i18n!../../js/nls/locales');
    var dashboardTmpl = require('text!../../templates/dashboardTmpl.html');
    var ThermostatView = require('app/ThermostatView');


    var Dashboard = Backbone.View.extend({

        template: _.template( dashboardTmpl ),

        events: {

        },

        initialize: function(options) {
            this.childViews = [];
            this.token = options.token;
        },

        render: function() {
            //this.onClose();
            this.$el.html( this.template( i18n ) );
            this.appendThermostat();
            return this;
        },

        appendThermostat: function () {

            var thermostatView = new ThermostatView({
                token: this.token
            });

            this.$el.find('#thermostat-container').html( thermostatView.render().el );
            // need it to remove this view upon removal of this.$el
            this.childViews.push(thermostatView);
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