define( function(require) {

    'use strict';

    var Backbone = require('backbone');
    var thermostatTmpl = require('text!../../templates/thermostatTmpl.html');

    var ThermostatView = Backbone.View.extend({

        template: _.template( thermostatTmpl ),

        initialize: function (options) {
            this.childViews = [];
			this.token = options.token;
        },

        events: {
            'click #up-button': 'upButton',
            'click #down-button': 'downButton',
            'click #heating-up-button-heat': 'heatingUpButtonHeat',
            'click #heating-down-button': 'heatingDownButton',
            'click #cooling-up-button': 'coolingUpButton',
            'click #cooling-down-button': 'coolingDownButton'
        },

        render: function () {
            //this.onClose();
            this.$el.html( this.template() );
            this.setFirebase();
            return this;
        },

        upButton: function () {
            var scale = this.thermostat.temperature_scale,
                adjustment = scale === 'F' ? +1 : +0.5;
            this.adjustTemperature(adjustment, scale);
        },

        downButton: function() {
            var scale = this.thermostat.temperature_scale,
                adjustment = scale === 'F' ? -1 : -0.5;
            this.adjustTemperature(adjustment, scale);
        },

        heatingUpButtonHeat: function () {
            var scale = this.thermostat.temperature_scale,
                adjustment = scale === 'F' ? +1 : +0.5;
            this.adjustTemperature(adjustment, scale, 'heat');
        },

        coolingUpButton: function () {
            var scale = this.thermostat.temperature_scale,
                adjustment = scale === 'F' ? +1 : +0.5;
            this.adjustTemperature(adjustment, scale, 'cool');
        },

        heatingDownButton: function () {
            var scale = thermostat.temperature_scale,
                adjustment = scale === 'F' ? -1 : -0.5;
            adjustTemperature(adjustment, scale, 'heat');
        },

        coolingDownButton: function () {
            var scale = this.thermostat.temperature_scale,
                adjustment = scale === 'F' ? -1 : -0.5;
            this.adjustTemperature(adjustment, scale, 'cool');
        },

        adjustTemperature: function(degrees, scale, type) {
            scale = scale.toLowerCase();
            type = type ? type + '_' : '';

            var dataRef = new Firebase('wss://developer-api.nest.com');
            dataRef.authWithCustomToken( this.token, function(error, authData) {
                if (error) {
                    console.log("Authentication Failed!", error);
                }
            });

            var newTemp = this.thermostat['target_temperature_' + scale] + degrees,
                path = 'devices/thermostats/' + this.thermostat.device_id + '/target_temperature_' + type + scale;

            if (this.thermostat.is_using_emergency_heat) {
                console.error("Can't adjust target temperature while using emergency heat.");
            } else if (this.thermostat.hvac_mode === 'heat-cool' && !type) {
                console.error("Can't adjust target temperature while in Heat • Cool mode, use target_temperature_high/low instead.");
            } else if (type && this.thermostat.hvac_mode !== 'heat-cool') {
                console.error("Can't adjust target temperature " + type + " while in " + thermostat.hvac_mode +  " mode, use target_temperature instead.");
            } else if (this.structure.away.indexOf('away') > -1) {
                console.error("Can't adjust target temperature while structure is set to Away or Auto-away.");
            } else { // ok to set target temperature
                dataRef.child(path).set(newTemp);
            }
        },

        setFirebase: function() {
            var self = this;

            var dataRef = new Firebase('wss://developer-api.nest.com');
            dataRef.authWithCustomToken( this.token, function(error, authData) {
                if (error) {
                    console.log("Authentication Failed!", error);
                }
            });

            dataRef.on('value', function (snapshot) {
                var data = snapshot.val();

                // For simplicity, we only care about the first
                // thermostat in the first structure
                self.structure = self.firstChild(data.structures);
                self.thermostat = data.devices.thermostats[self.structure.thermostats[0]];

                // TAH-361, device_id does not match the device's path ID
                thermostat.device_id = self.structure.thermostats[0];

                self.updateThermostatView( self.thermostat );
                self.updateStructureView( self.structure );

            });
        },

        updateThermostatView: function (thermostat) {
            var scale = thermostat.temperature_scale;

            $('.temperature-scale').text(scale);
            $('#target-temperature .hvac-mode').text(thermostat.hvac_mode);
            $('#device-name').text(thermostat.name);
            this.updateTemperatureDisplay(thermostat);
        },

        updateStructureView: function (structure) {
            if (structure.away === 'home') {
                $('#target-temperature').addClass('home');
            } else {
                $('#target-temperature').removeClass('home');
            }
        },

        firstChild: function (object) {
            for(var key in object) {
                return object[key];
            }
        },

        updateTemperatureDisplay: function (thermostat) {
            var scale = thermostat.temperature_scale.toLowerCase();

            // For Heat • Cool mode, we display a range of temperatures
            // we support displaying but not changing temps in this mode
            if (thermostat.hvac_mode === 'heat-cool') {
                $('#target-temperature .temp').text(
                    thermostat['target_temperature_low_' + scale] + ' • ' +
                    thermostat['target_temperature_high_' + scale]
                );

                // Display the string 'off' when the thermostat is turned off
            } else if (thermostat.hvac_mode === 'off') {
                $('#target-temperature .temp').text('off');

                // Otherwise just display the target temperature
            } else {
                $('#target-temperature .temp').text(thermostat['target_temperature_' + scale] + '°');
                $('#heating-up-button, #heating-down-button, #cooling-up-button, #cooling-down-button').hide();
            }

            // Update ambient temperature display
            $('#ambient-temperature .temp').text(thermostat['ambient_temperature_' + scale] + '°');
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

    return ThermostatView;

});