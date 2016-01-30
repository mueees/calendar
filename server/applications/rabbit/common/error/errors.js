module.exports = {
    feed_unexpected_load_page: {
        code: 1,
        description: 'Feed error. Cannot load page due to unexpected error',
        fields: ['feedId']
    },
    feed_bad_status_load_page: {
        code: 2,
        description: 'Feed error. Cannot load page due to error status code',
        fields: ['feedId']
    },
    feed_cannot_parse_xml: {
        code: 3,
        description: 'Feed error. Rss xml exist but system cannot parse it.',
        fields: ['fieldId']
    },
    post_prepare_unexpected_load_page: {
        code: 5,
        description: 'Post error. Cannot load page due to unexpected error',
        fields: ['post']
    },
    post_prepare_bad_status_load_page: {
        code: 6,
        description: 'Post error. Cannot load page due to error status code',
        fields: ['post']
    },
    unknown_error: {
        code: 666,
        description: 'Unknown error'
    }
};