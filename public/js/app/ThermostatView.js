define( function(require) {

    'use strict';

    var Backbone = require('backbone');
    var thermostatTmpl = require('text!../../templates/thermostatTmpl.html');

    var ThermostatView = Backbone.View.extend({

        template: _.template( thermostatTmpl ),

        initialize: function (options) {
            this.childViews = [];
			this.token = options.token;
			this.dataRef = options.dataRef;
        },

        events: {

        },

        render: function () {
            //this.onClose();
            this.$el.html( this.template() );
			this.setThermostat();
            return this;
        },

        // sets thermostat
        setThermostat: function() {
		
			var nestToken  = this.token,
				thermostat = {},
				structure  = {};

			if (nestToken) { // Simple check for token

			  // Create a reference to the API using the provided token
			  var dataRef = this.dataRef;
			  //dataRef.auth(nestToken);


			} else {
			  // No auth token, go get one
			  window.location.replace('/auth/nest');
			}

			/**
			  The appropriate version of target temperature to display is based on
			  the following parameters:

			  * hvac_mode (C or F)
			  * temperature_scale (heat-cool, heat, cool, or off)

			  When hvac_mode is 'heat-cool' we display both the low and the high setpoints like:

				68 • 80° F

			  For 'heat' or 'cool' just the temperature is displayed

				70° F

			  For 'off' we show that the thermostat is off:

				OFF

			  Away modes are handled separately

			  @method
			  @param object thermostat model
			  @returns undefined
			*/
			function updateTemperatureDisplay (thermostat) {
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
			}

			/**
			  Updates the thermostat view with the latests data

			  * Temperature scale
			  * HVAC mode
			  * Target and ambient temperatures
			  * Device name

			  @method
			  @param object thermostat model
			  @returns undefined
			*/
			function updateThermostatView(thermostat) {
			  var scale = thermostat.temperature_scale;

			  $('.temperature-scale').text(scale);
			  $('#target-temperature .hvac-mode').text(thermostat.hvac_mode);
			  $('#device-name').text(thermostat.name);
			  updateTemperatureDisplay(thermostat);
			}

			/**
			  Updates the structure's home/away state by
			  adding the class 'home' when the structure is
			  set to home, and removing it when in any away state

			  @method
			  @param object structure
			  @returns undefined
			*/
			function updateStructureView (structure) {
			  if (structure.away === 'home') {
				$('#target-temperature').addClass('home');
			  } else {
				$('#target-temperature').removeClass('home');
			  }
			}

			/**
			  Updates the thermostat's target temperature
			  by the specified number of degrees in the
			  specified scale. If a type is specified, it
			  will be used to set just that target temperature
			  type

			  @method
			  @param Number degrees
			  @param String temperature scale
			  @param String type, high or low. Used in heat-cool mode (optional)
			  @returns undefined
			*/
			function adjustTemperature(degrees, scale, type) {
			  scale = scale.toLowerCase();
			  type = type ? type + '_' : '';
			  var newTemp = thermostat['target_temperature_' + scale] + degrees,
				  path = 'devices/thermostats/' + thermostat.device_id + '/target_temperature_' + type + scale;

			  if (thermostat.is_using_emergency_heat) {
				console.error("Can't adjust target temperature while using emergency heat.");
			  } else if (thermostat.hvac_mode === 'heat-cool' && !type) {
				console.error("Can't adjust target temperature while in Heat • Cool mode, use target_temperature_high/low instead.");
			  } else if (type && thermostat.hvac_mode !== 'heat-cool') {
				console.error("Can't adjust target temperature " + type + " while in " + thermostat.hvac_mode +  " mode, use target_temperature instead.");
			  } else if (structure.away.indexOf('away') > -1) {
				console.error("Can't adjust target temperature while structure is set to Away or Auto-away.");
			  } else { // ok to set target temperature
				dataRef.child(path).set(newTemp);
			  }
			}

			/**
			  When the user clicks the up button,
			  adjust the temperature up 1 degree F
			  or 0.5 degrees C

			*/
			$('#up-button').on('click', function () {
			  var scale = thermostat.temperature_scale,
				  adjustment = scale === 'F' ? +1 : +0.5;
			  adjustTemperature(adjustment, scale);
			});

			/**
			  When the user clicks the down button,
			  adjust the temperature down 1 degree F
			  or 0.5 degrees C

			*/
			$('#down-button').on('click', function () {
			  var scale = thermostat.temperature_scale,
				  adjustment = scale === 'F' ? -1 : -0.5;
			  adjustTemperature(adjustment, scale);
			});

			/**
			  When the user clicks the heating up button,
			  adjust the temperature up 1 degree F
			  or 0.5 degrees C

			*/
			$('#heating-up-button-heat').on('click', function () {
			  var scale = thermostat.temperature_scale,
				  adjustment = scale === 'F' ? +1 : +0.5;
			  adjustTemperature(adjustment, scale, 'heat');
			});

			/**
			  When the user clicks the heating down button,
			  adjust the temperature down 1 degree F
			  or 0.5 degrees C

			*/
			$('#heating-down-button').on('click', function () {
			  var scale = thermostat.temperature_scale,
				  adjustment = scale === 'F' ? -1 : -0.5;
			  adjustTemperature(adjustment, scale, 'heat');
			});

			/**
			  When the user clicks the cooling up button,
			  adjust the temperature up 1 degree F
			  or 0.5 degrees C

			*/
			$('#cooling-up-button').on('click', function () {
			  var scale = thermostat.temperature_scale,
				  adjustment = scale === 'F' ? +1 : +0.5;
			  adjustTemperature(adjustment, scale, 'cool');
			});

			/**
			  When the user clicks the cooling down button,
			  adjust the temperature down 1 degree F
			  or 0.5 degrees C

			*/
			$('#cooling-down-button').on('click', function () {
			  var scale = thermostat.temperature_scale,
				  adjustment = scale === 'F' ? -1 : -0.5;
			  adjustTemperature(adjustment, scale, 'cool');
			});

			/**
			  Utility method to return the first child
			  value of the passed in object.

			  @method
			  @param object
			  @returns object
			*/
			function firstChild(object) {
			  for(var key in object) {
				return object[key];
			  }
			}

			/**
			  Start listening for changes on this account,
			  update appropriate views as data changes.

			*/
			dataRef.on('value', function (snapshot) {
			  var data = snapshot.val();

			  // For simplicity, we only care about the first
			  // thermostat in the first structure
			  structure = firstChild(data.structures),
			  thermostat = data.devices.thermostats[structure.thermostats[0]];

			  // TAH-361, device_id does not match the device's path ID
			  thermostat.device_id = structure.thermostats[0];

			  updateThermostatView(thermostat);
			  updateStructureView(structure);

			});
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