var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
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
    useProxy: {
        type: Boolean,
        require: true
    },
    redirectUrl: {
        type: String,
        require: true
    },
    userId: {
        type: ObjectId,
        require: true
    },
    privateKey: {
        type: String,
        require: true
    },
    oauthKey: {
        type: String,
        require: true
    },
    domain: {
        type: String,
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
    data.privateKey = heplers.util.getUUID();
    data.oauthKey = heplers.util.getUUID();

    var application = new this(data);

    application.save(function (err, application) {
        if (err) {
            return cb('Server error');
        }

        cb(null, application);
    });
};

applicationSchema.statics.refreshPrivateKey = function (applicationId, cb) {
    this.findOne({
        applicationId: applicationId
    }, function (err, application) {
        if (err) {
            log.error(err);
            return cb('Server error');
        }

        if(!application){
            return cb('Cannot find application');
        }

        application.privateKey = heplers.util.getUUID();

        application.save(function (err, application) {
            if (err){
                log.error(err);
                return cb('Server error');
            }

            cb(null, application.privateKey);
        });
    });
};

var Application = mongoose.model('Applications', applicationSchema);

module.exports = Application;