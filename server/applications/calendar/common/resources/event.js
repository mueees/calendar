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
    date_create: {
        type: 'Date',
        default: new Date()
    }
});

var Event = mongoose.model('Event', eventSchema);

module.exports = Event;