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
    create_date: {
        type: Date,
        default: new Date()
    }
});

errorSchema.statics.getAllFeedErrors = function () {
    var def = Q.defer();

    Error.find({
        errorCode: {
            $in: [1, 2]
        }
    }, function (err, feedErrors) {
        if (err) {
            logger.error(err);

            return def.reject(err.message);
        }

        def.resolve(feedErrors);
    });

    return def.promise;
};

var Error = mongoose.model('Error', errorSchema);

module.exports = Error;