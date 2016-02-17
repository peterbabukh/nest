define( function(require) {

    'use strict';

    var Backbone = require('backbone');
    var i18n = require('i18n!../../js/nls/locales');
    var homeTmpl = require('text!../../templates/homeTmpl.html');
    var appHeaderTmpl = require('text!../../templates/appHeaderTmpl.html');
    var AppHeaderView = require('app/AppHeaderView');
    var DashboardView = require('app/DashboardView');
    var NestModel = require('app/NestModel');

    var Home = Backbone.View.extend({

        el: $('.content-box'),

        template: _.template(homeTmpl),

        events: {
            'change #setStateSel': 'setState'
        },

        initialize: function () {
            this.childViews = [];
            this.model = {};
        },

        render: function () {
            //this.onClose();
            this.checkToken();
            this.$el.html(this.template(i18n));
            this.appendHeader();
            this.appendDashboardView();
            this.getFirebase();
            this.signinNest();
            return this;
        },

        checkToken: function () {

            // Get auth token from cookie.
            var token = Cookies.get('nest_token');

            if ( token ) {
                // Create a reference to the API using the provided token
                //var dataRef = new Firebase('https://developer-api.nest.com');
                //var dataRef = new Firebase('wss://developer-api.nest.com');
                //dataRef.auth( token );

                this.token = token;

            } else {
                // No auth token, go get one
                window.location.replace('/auth/nest');
            }
        },

        appendHeader: function () {
            var appHeaderView = new AppHeaderView();
            // used prepend instead of append for further adaptive css purposes
            this.$el.prepend(appHeaderView.render().el);
            // need it to remove this view upon removal of this.$el
            this.childViews.push(appHeaderView);
        },

        appendDashboardView: function () {
            var dashboardView = new DashboardView();
            $('.dashboard').html(dashboardView.render().el);
            // need it to remove this view upon removal of this.$el
            this.childViews.push(dashboardView);
        },

        // added for testing purposes to see the way firebase works
        getFirebase: function () {

            var myDataRef = new Firebase('https://safe-home.firebaseio.com/');

            $('#messageInput').keypress(function (e) {
                if (e.keyCode == 13) {
                    var name = $('#nameInput').val();
                    var text = $('#messageInput').val();
                    myDataRef.push({name: name, text: text});
                    $('#messageInput').val('');
                }
            });

            myDataRef.on('child_added', function (snapshot) {
                var message = snapshot.val();
                displayChatMessage(message.name, message.text);
            });

            function displayChatMessage(name, text) {
                $('<div/>').text(text).prepend($('<em/>').text(name + ': ')).appendTo($('.userMessage'));
                $('.userMessage')[0].scrollTop = $('.userMessage')[0].scrollHeight;
            }

        },

        // gets connected to Nest API and attaches event listeners.
        signinNest: function () {

            var self = this;

            // The Nest API will emit events from this URL.
            var NEST_API_URL = 'https://developer-api.nest.com';

            if (!window.EventSource) {
                alert('Your browser does not support EventSource. Try another browser.');
                throw new Error('Your browser does not support EventSource.');
            }

            /**
             * Create an EventSource object which handles the long-running GET request to
             * the Nest REST Streaming API. The EventSource object emits events as they are
             * published by the API.
             */
            var source = new EventSource(NEST_API_URL + '?auth=' + this.token);

            /**
             * The 'put' event is received when a change is made to any of the Nest devices.
             */
            source.addEventListener('put', function (e) {

                var data = JSON.parse(e.data).data || {};

                var devices = data.devices || {};
                var thermostats = devices.thermostats || {};
                var smokeAlarms = devices.smoke_co_alarms || {};
                var cameras = devices.cameras || {};
                var structures = data.structures || {};

                self.model = new NestModel(data);
                self.model.on('change', self.updateNest, self);

                // updates devices info
                self.updateDevices(thermostats, smokeAlarms, cameras);
                self.changeState();

            });

            /**
             * When the authentication token is revoked, log out the user.
             */
            source.addEventListener('auth_revoked', function (e) {
                window.location = '/nest/logout';
            });

            /**
             * The 'open' event is emitted when a connection is established with the API.
             */

            source.addEventListener('open', function (e) {
                $('#connect-state-img').attr('src', '/assets/img/green-state.png');
            }, false);

            source.addEventListener('close', function (e) {
                $('#connect-state-img').attr('src', '/assets/img/red-state.png');
            }, false);

            /**
             * The 'error' event is emitted when an error occurs, such as when the connection
             * between the EventSource and the API is lost.
             */
            source.addEventListener('error', function (e) {
                if (e.readyState == EventSource.CLOSED) {
                    console.error('Connection was closed! ', e);
                } else {
                    console.error('An error occurred: ', e);
                }
                $('#connect-state-img').attr('src', '/assets/img/red-state.png');
            }, false);


        },

        // updates each device data
        // TODO: pass this function to DashboardView and trigger it by model onchange event.
        updateDevices: function (thermostats, smokeAlarms, cameras) {

            var arr = [thermostats, smokeAlarms, cameras];
            var str = '';
            var ul = document.createElement('UL');

            _.each(arr, function (devices) {

                _.each(devices, function (device) {

                    var name = device.name_long;
                    var location = device.name;

                    // Creates .dataHistory text.
                    var output = '<p>You have a ' + name + ' working in the ' + location + '</p>\n';
                    str += output;

                    // Creates sidenav-dev-list.
                    // TODO: the below code will be further on replaced with a template
                    // and transfered to a separate function as the logic will get more complecated.
                    var li = document.createElement('LI');
                    var a = document.createElement('A');
                    a.classList.add('fullWidth');
                    a.setAttribute('href', '#');
                    a.appendChild(document.createTextNode(name));
                    li.appendChild(a);
                    ul.appendChild(li);

                });
            });

            $('.dataHistory').empty().append(str);
            $('#sidenav-dev-list').empty().append(ul);

        },

        changeState: function () {
            var structures = this.model.get('structures');
            var state = structures[_.keys(structures)].away;

            $('.home-state').text(state);

        },

        setState: function () {

            var chosenValue = $('#changeStateSel :selected').val();
            var structures = this.model.get('structures');
            var structuresId = _.keys(structures);

            this.model.set(structures[structuresId].away, chosenValue);

        },

        // Removes children views and their children views from DOM and thus prevents memory leaks
        onClose: function () {
            _.each(this.childViews, function (view) {
                if (view && view.close) {
                    view.close();
                }
            });
            this.childViews.length = 0;
        },

        /*
        // updates Nest model
        updateNest: function () {


        }
        */

    });

    return Home;

});