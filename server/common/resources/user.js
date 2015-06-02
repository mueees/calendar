var mongoose = require('mongoose'),
    crypto = require('crypto'),
    async = require('async'),
    heplers = require('common/helpers'),
    Q = require('q'),
    tokenSchema = require('./token'),
    applicationSchema = require('./application'),
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
    },

    token_account: {
        type: [tokenSchema],
        default: []
    },

    applications: {
        type: [applicationSchema],
        default: []
    }
});

userSchema.statics.signup = function (email, password, cb) {
    var sha1 = crypto.createHash('sha1');

    // todo: move to separate function
    sha1.update(password + email + password);
    password = sha1.digest('hex');

    var user = new this({
        email: email,
        password: password,
        confirmationId: heplers.util.getUUID()
    });

    user.save(function (err, user) {
        if (err) {
            return cb('Server error');
        }

        cb(null, user);
    });
};

userSchema.statics.isRightCredential = function (email, password, cb) {
    var me = this;

    async.waterfall([
        function (cb) {
            me.isUserExist(email, cb);
        },
        function (user, cb) {
            if(!user){
                return cb("Wrong login or password");
            }
            if(User.comparePassword(password, user.password, user.email)){
                cb(null, user);
            }else{
                cb("Wrong login or password");
            }
        }
    ], function (err, user) {
        if(err){
            console.log(err);
            return cb(err);
        }

        cb(null, user);
    });
};

userSchema.statics.comparePassword = function(password, userPassword, userEmail){
    var sha1 = crypto.createHash('sha1');
    sha1.update(password + userEmail + password);
    var password = sha1.digest('hex');

    return (password == userPassword) ? true : false;
};

userSchema.statics.isUserExist = function (email, cb) {
    this.find({email: email}, null, function(err, users){
        if( err ){
            return cb("Server error");
        }

        if( users.length === 0 ){
            cb(null, false);
        }else{
            cb(null, users[0]);
        }
    });
};

userSchema.statics.isHaveConfirmationId = function(confirmationId, cb){
    this.find({confirmationId: confirmationId}, null, function(err, users){
        if( err ){
            return cb("Server error");
        }

        if( users.length === 0 ){
            cb(null, false);
        }else{
            cb(null, users[0]);
        }
    });
};

userSchema.statics.getUserByAccountToken = function(token, cb){
    this.find({
        token_account: {
            $all: [
                {
                    "$elemMatch" : {
                        token: token
                    }
                }
            ]
        }
    }, null, function(err, users){
        if( err ){
            return cb("Server error");
        }

        if(!users){
            cb(null, false);
        } else if( users.length === 0 ){
            cb(null, false);
        }else{
            cb(null, users[0]);
        }
    });
};

userSchema.methods.confirm = function(cb){
    this.update({
        confirmationId: null,
        date_confirm: new Date(),
        status: 200
    }, function(err, user){
        if(err){
            return cb("Server error");
        }

        cb(null, user);
    })
};

userSchema.methods.isConfirm = function () {
    return (this.confirmationId) ? false : true;
};

userSchema.methods.generateAccountToken = function (cb) {
    var date = new Date(),
        token = {
            token: heplers.util.getUUID(),
            date_expired: new Date( date.setDate(date.getDate() + 31) )
        };

    this.token_account.push(token);

    this.save(function (err, user) {
        if(err){
            return cb("Server error");
        }

        cb(null, token);
    });
};

var User = mongoose.model('users', userSchema);

module.exports = User;