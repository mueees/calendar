var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Q = require('q'),
    log = require('common/log')(module);

var topicSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    title_img: {
        type: String
    },
    main: {
        type: Boolean,
        default: false
    },
    related_topics: {
        type: [ObjectId],
        default: []
    }
});

// Remove Topic from related topics
topicSchema.statics.removeFromRelatedTopics = function (topicId) {
    var def = Q.defer();

    Topic.update({}, {
        $pull: {
            related_topics: topicId
        }
    }, {
        multi: true
    }, function (err) {
        if (err) {
            log.error(err);

            return def.reject(err);
        }

        def.resolve();
    });

    return def.promise;
};

var Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;