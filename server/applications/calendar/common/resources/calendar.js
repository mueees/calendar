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
    }
});

var Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;