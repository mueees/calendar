var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

var calendarSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date_create: {
        type: 'Date',
        default: new Date()
    },
    description: {
        type: String,
        default: ''
    },
    userId: {
        type: ObjectId,
        required: true
    },

    // UI section

    // is show events from this calendar on UI
    active: {
        type: Boolean,
        default: true
    },

    // string, that determinate event color for this calendar
    color: {
        type: String,
        default: 'lagoon'
    }
});

var Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;