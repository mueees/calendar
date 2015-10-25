db.posts.find({}).count();

// find posts with the same parameters
db.posts.aggregate({
        $group: {
            // Group by fields to match on (a,b)
            _id: {
                feedId: "$feedId"
            },

            // Count number of matching docs for the group
            count: {
                $sum: 1
            }
        }
    },

    // Limit results to duplicates (more than 1 match)
    {
        $match: {
            count: {
                $gt: 1
            }
        }
    },
    {
        $sort: {
            count: -1
        }
    });