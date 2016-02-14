define( function(require) {

    'use strict';

    var Backbone = require('backbone');
    var i18n = require('i18n!../../js/nls/locales');
    var homeTmpl = require('text!../../templates/homeTmpl.html');
    var appHeaderTmpl = require('text!../../templates/appHeaderTmpl.html');
    var AppHeaderView = require('app/AppHeaderView');

    var Home = Backbone.View.extend({

        el: $('.content-box'),

        template: _.template( homeTmpl ),

        events: {

        },

        initialize: function() {
            this.childViews = [];
        },

        render: function() {
            this.onClose();
			this.$el.html( this.template( i18n ) );
            this.appendHeader();
            this.getFirebase();
			return this;
        },

        appendHeader: function() {
            var appHeaderView = new AppHeaderView();
            // used prepend instead of append for further adaptive css purposes
            this.$el.prepend( appHeaderView.render().el );

            // need it to remove this view upon removal of this.$el
            this.childViews.push( appHeaderView );
        },

        // Removes children views and their children views from DOM and thus prevents memory leaks
        onClose: function() {
            _.each( this.childViews, function(view){
                if (view && view.close) {
                    view.close();
                }
            });
            this.childViews.length = 0;
        },

        getFirebase: function() {

            var myDataRef = new Firebase('https://safe-home.firebaseio.com/');
            $('#messageInput').keypress(function (e) {
                if (e.keyCode == 13) {
                    var name = $('#nameInput').val();
                    var text = $('#messageInput').val();
                    myDataRef.push({name: name, text: text});
                    $('#messageInput').val('');
                }
            });
            myDataRef.on('child_added', function(snapshot) {
                var message = snapshot.val();
                displayChatMessage(message.name, message.text);
            });
            function displayChatMessage(name, text) {
                $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#content'));
                $('#content')[0].scrollTop = $('#content')[0].scrollHeight;

                $('#connect-state-img').attr('src', '/assets/img/green-state.png');
            };

        }



    });

    return Home;

});