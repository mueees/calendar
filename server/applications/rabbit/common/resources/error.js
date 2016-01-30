var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Q = require('q'),
    log = require('common/log')(module);

var errorSchema = new Schema({
    errorCode: {
        type: Number,
        required: true
    },
    data: {
        type: Object,
        defaut: {}
    },
    forHumanBeing: {
        type: Boolean,
        default: false
    },
    fixing_date: {
        type: Date
    },
    create_date: {
        type: Date,
        default: new Date()
    }
});

errorSchema.statics.getAllFeedErrors = function () {
    var def = Q.defer();

    Error.find({
        errorCode: {
            $in: [1, 2, 3]
        }
    }, function (err, feedErrors) {
        if (err) {
            log.error(err);

            return def.reject(err.message);
        }

        def.resolve(feedErrors);
    });

    return def.promise;
};

errorSchema.statics.removeSimilar = function (errorId) {
    var def = Q.defer();

    Error.findOne({
        _id: errorId
    }, function (err, error) {
        if (err) {
            log.error(err.message);

            return def.reject(err.message);
        }

        if (error) {
            Error.remove({
                errorCode: error.errorCode,
                data: error.data
            }, function (err) {
                if (err) {
                    log.error(err);

                    return def.reject(err.message);
                }

                def.resolve();
            });
        } else {
            def.resolve();
        }
    });

    return def.promise;
};

errorSchema.methods.setForHuman = function () {
    var def = Q.defer();

    this.forHumanBeing = true;
    this.fixing_date = new Date();

    this.save(function (err) {
        if (err) {
            log.error(err);

            return def.reject(err.message);
        }

        def.resolve();
    });

    return def.promise;
};

var Error = mongoose.model('Error', errorSchema);

module.exports = Error;