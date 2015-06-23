var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    heplers = require('common/helpers');

var permissionSchema = new Schema({
    ticket: {
        type: String,
        default: heplers.util.getUUID()
    },
    date_create: {
        type: Date,
        default: new Date()
    },
    userId: {
        type: ObjectId,
        require: true
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
    applicationId: {
        type: String,
        require: true
    },
    isTicketExchanged: {
        type: Boolean,
        default: false
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

permissionSchema.methods.exchangeTicketToTokens = function (cb) {
    this.isTicketExchanged = true;
    this.access_token = heplers.util.getUUID();
    this.refresh_token = heplers.util.getUUID();
    this.date_exchange = new Date();

    this.save(cb);
};

permissionSchema.methods.refreshToken = function (cb) {
    this.access_token = heplers.util.getUUID();
    this.date_exchange = new Date();

    this.save(cb);
};

permissionSchema.methods.isExpired = function (timeExpired) {
    return ((new Date()).getTime() - this.date_exchange) > timeExpired;
};

var Permission = mongoose.model('Permissions', permissionSchema);

module.exports = Permission;