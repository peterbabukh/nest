var mongoose = require('../lib/mongoose');
var User = require('./User');

var Schema = mongoose.Schema;

// create the pattern for every single word model to be saved in db
var schema = new Schema({

    wordGroup: {
        type: String
    },
    enWord: {
        type: String
    },
    ruWord: {
        type: String
    },
    enSynonyms: {
        type: String
    },
    ruSynonyms: {
        type: String
    },
    grade: {
        type: Schema.Types.Mixed
    },
    lesson: {
        type: Number
    },
    creator: {
        type: String,
        default: 'admin'
    },
    _user_id: {
        type: String
    }
});

module.exports = mongoose.model('Rooms', schema);