var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    heplers = require('common/helpers');

var applicationSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        default: ''
    },
    applicationId: {
        type: String,
        require: heplers.util.getUUID()
    },
    userId: {
        type: ObjectId,
        require: true
    },
    privateKey: {
        type: 'String',
        require: true
    },
    date_create: {
        type: Date,
        default: new Date()
    },

    // 400 blocked or paused
    status: {
        type: Number,
        default: 200
    }
});

applicationSchema.statics.create = function (data, cb) {
    data.applicationId = heplers.util.getUUID();

    var application = new this(data);

    application.save(function (err, application) {
        if (err) {
            return cb('Server error');
        }

        cb(null, application);
    });
};

var Application = mongoose.model('Applications', applicationSchema);

module.exports = Application;