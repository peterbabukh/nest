var crypto = require('crypto');
var async = require('async');
var mongoose = require('../lib/mongoose');

var Room = require('./Room').schema;

var Schema = mongoose.Schema;

var schema = new Schema({

    email: {
        type: String,
        unique: true
    },

    hashedPassword: {
        type: String
    },

    salt: {
        type: String
    },

    resetPasswordToken: String,

    resetPasswordExpires: Number,

    created: {
        type: Date,
        default: Date.now
    },

    rooms: [Room]


});

schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
};

schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

exports.User = mongoose.model('User', schema);


