module.exports = {
    feed_unexpected_load_page: {
        code: 1,
        description: 'Feed error. Cannot load page due to unexpected error',
        fields: ['feedId'],
        beforeActions: ['blockFeed']
    },
    feed_bad_status_load_page: {
        code: 2,
        description: 'Feed error. Cannot load page due to error status code',
        fields: ['feedId']
    },
    3: {
        code: 3,
        description: 'Cannot extract posts from page due to unexpected error',
        fields: ['feedId']
    },
    4: {
        code: 4,
        description: 'Cannot extract feed info from page due to unexpected error',
        fields: ['feedId']
    },
    unknown_error: {
        code: 666,
        description: 'Unknown error'
    }
};