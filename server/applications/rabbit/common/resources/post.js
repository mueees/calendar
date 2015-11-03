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
    description: {
        type: String,
        default: ''
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

postSchema.statics.findPosts = function (query) {
    var def = Q.defer();

    Post.aggregate([
        {
            $match: {
                feedId: new ObjectId(query.feedId)
            }
        },
        {
            $sort: {
                public_date: -1
            }
        },
        {
            $skip: query.from
        },
        {
            $limit: query.count
        },
        {
            $project: {
                "users": {
                    $cond: [
                        {
                            $eq: [
                                "$users", []
                            ]
                        },
                        [
                            {
                                isRead: false,
                                readLater: false,
                                tags: [],
                                userId: query.userId
                            }
                        ],
                        '$users'
                    ]
                },
                title: 1,
                body: 1,
                image: 1,
                guid: 1,
                link: 1,
                feedId: 1,
                pubdate: 1
            }
        },
        {
            $unwind: "$users"
        },
        {
            $match: {
                $or: [
                    {
                        "users.userId": new ObjectId(query.userId)
                    },
                    {
                        "users.userId": query.userId
                    }
                ]
            }
        }
    ], function (err, posts) {
        if (err) {
            logger.error(err.message);
            return cb("Cannot find posts");
        }
        cb(err, posts);
    });

    return def.promise;
};

var Post = mongoose.model('Post', postSchema);

module.exports = Post;