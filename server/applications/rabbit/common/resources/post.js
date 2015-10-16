var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    log = require('common/log')(module),
    Q = require('q');

var postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    public_date: {
        type: Date,
        default: new Date()
    },
    create_date: {
        type: Date,
        default: new Date()
    },
    guid: {
        type: String,
        required: true,
        unique: true
    },
    feedId: {
        type: ObjectId,
        required: true
    },
    title_image: {
        type: String
    }
});

postSchema.statics.getCount = function (query) {
    var def = Q.defer();

    Post.find(query, function (err, posts) {
        if (err) {
            log.error(err.message);
            return def.reject('Server error');
        }

        def.resolve(posts.length);
    });

    return def.promise;
};

var Post = mongoose.model('Post', postSchema);

module.exports = Post;