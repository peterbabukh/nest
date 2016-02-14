define( function(require) {

    'use strict';

    var Backbone = require('backbone');
    var i18n = require('i18n!../../js/nls/locales');
    var appHeaderTemplate = require('text!../../templates/appHeaderTmpl.html');

    var AppHeaderView = Backbone.View.extend({

        template: _.template( appHeaderTemplate ),

        initialize: function () {
            this.childViews = [];
        },

        events: {
            'click .signout-btn': 'signOut'
        },

        render: function () {
            this.onClose();
            this.$el.html( this.template( i18n ) );
            return this;
        },

        signOut: function () {
            var conf = confirm( i18n.conf.signOutWarning );
            if (conf) {
                this.goTo('/signout');
                window.location.reload();
            }
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

    return AppHeaderView;

});