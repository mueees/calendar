var mongoose = require('mongoose'),
    crypto = require('crypto'),
    async = require('async'),
    heplers = require('common/helpers'),
    Q = require('q'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var userSchema = new Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    confirmationId: {
        type: String,
        default: ""
    },

    date_create: {
        type: Date,
        default: new Date
    },

    date_confirm: {
        type: Date,
        default: null
    },

    //200 - active
    //403 - blocking
    //400 - not confirmed
    status: {
        type: Number,
        default: 400,
        required: true
    }
});

userSchema.statics.registerNewUser = function (email, password) {
    var deferred = Q.defer(),
        sha1 = crypto.createHash('sha1');

    // todo: move to separate function
    sha1.update(password + email + password);
    password = sha1.digest('hex');

    var user = new this({
        email: email,
        password: password,
        confirmationId: heplers.util.getUUID()
    });

    user.save(function (err, user) {
        if(err){
            deferred.reject(err);
            return;
        }

        deferred.resolve(user);
    });

    return deferred.promise;
};

userSchema.statics.isUserExist = function(email, cb){
    this.find({email: email}, null, function(err, users){
        if( err ){
            logger.error(err);
            cb("Server error");
            return false;
        }

        if( users.length === 0 ){
            cb(null, false);
        }else{
            cb(null, users[0]);
        }
    });
};

var User = mongoose.model('users', userSchema);

module.exports = User;