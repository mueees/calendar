var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    heplers = require('common/helpers');

var permissionSchema = new Schema({
    userId: {
        type: ObjectId,
        require: true
    },
    applicationId: {
        type: String,
        require: true
    },
    ticket: {
        type: String,
        default: heplers.util.getUUID()
    },
    isTicketExchanged: {
        type: Boolean,
        default: false
    },
    access_token: {
        type: String,
        default: ''
    },
    refresh_token: {
        type: String,
        default: ''
    },
    date_exchange: {
        type: Date,
        default: null
    },
    date_create: {
        type: Date,
        default: new Date()
    }
});

permissionSchema.statics.create = function (data, cb) {
    data.ticket = heplers.util.getUUID();

    var permission = new this(data);

    permission.save(function (err, permission) {
        if (err) {
            return cb('Server error');
        }

        cb(null, permission);
    });
};

var Permission = mongoose.model('Permissions', permissionSchema);

module.exports = Permission;