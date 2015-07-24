var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

var eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    calendarId: {
        type: ObjectId,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    isAllDay: {
        type: Boolean,
        required: true
    },
    isRepeat: {
        type: Boolean,
        required: true
    },
    repeat: {
        type: Object,
        default: {}
    },
    date_create: {
        type: Date,
        default: new Date()
    }
});

var Event = mongoose.model('Event', eventSchema);

module.exports = Event;