var MueRequest = require('./index'),
    app = 'rabbit',
    statisticService = 'statistic',
    errorService = 'error',
    apiService = 'api';

function findPosts(queryString, userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'GET',
        url: '/posts?' + queryString,
        headers: {
            userid: userId
        }
    });
}

function findFeed(query, userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'POST',
        url: '/feeds/find',
        body: {
            query: query
        },
        headers: {
            userid: userId
        }
    });
}

function createCategory(data, userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'PUT',
        url: '/categories',
        body: data,
        headers: {
            userid: userId
        }
    });
}

function getCategories(userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'GET',
        url: '/categories',
        headers: {
            userid: userId
        }
    });
}

function deleteCategory(categoryId, userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'DELETE',
        url: '/categories/' + categoryId,
        headers: {
            userid: userId
        }
    });
}

function trackFeed(feed, userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'PUT',
        url: '/feeds/track',
        body: feed,
        headers: {
            userid: userId
        }
    });
}

function addFeed(feedId, categoryId, userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'PUT',
        url: '/feeds',
        body: {
            feedId: feedId,
            categoryId: categoryId
        },
        headers: {
            userid: userId
        }
    });
}

function deleteFeed(feedId, userId) {
    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'DELETE',
        url: '/feeds',
        body: {
            feedId: feedId
        },
        headers: {
            userid: userId
        }
    });
}

function feedsStatistic() {
    return MueRequest.request({
        app: app,
        service: statisticService,
        method: 'GET',
        url: '/statistic/feeds'
    });
}

function feedStatistic(feedId) {
    return MueRequest.request({
        app: app,
        service: statisticService,
        method: 'GET',
        url: '/statistic/feeds/' + feedId
    });
}

function setLastUpdateDate(feedId) {
    return MueRequest.request({
        app: app,
        service: statisticService,
        method: 'POST',
        url: '/statistic/feeds/' + feedId + '/lastUpdateTime'
    });
}

function getPopularFeeds(userId, feedCount) {
    feedCount = feedCount || 3;

    return MueRequest.request({
        app: app,
        service: apiService,
        method: 'GET',
        url: '/feeds/popular?count=' + feedCount,
        headers: {
            userid: userId
        }
    });
}

function updateFollowedCount(userId) {
    return MueRequest.request({
        app: app,
        service: statisticService,
        method: 'GET',
        url: '/statistic/updateFollowedCount',
        headers: {
            userid: userId
        }
    });
}

function sendErrorReport(data) {
    return MueRequest.request({
        app: app,
        service: errorService,
        method: 'PUT',
        url: '/error/error',
        body: data
    });
}

function getAllFeedErrors() {
    return MueRequest.request({
        app: app,
        service: errorService,
        method: 'GET',
        url: '/error/error/feeds'
    });
}

exports.findPosts = findPosts;
exports.findFeed = findFeed;
exports.addFeed = addFeed;
exports.deleteFeed = deleteFeed;
exports.trackFeed = trackFeed;
exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.deleteCategory = deleteCategory;
exports.feedStatistic = feedStatistic;
exports.feedsStatistic = feedsStatistic;
exports.setLastUpdateDate = setLastUpdateDate;
exports.getPopularFeeds = getPopularFeeds;
exports.updateFollowedCount = updateFollowedCount;
exports.sendErrorReport = sendErrorReport;
exports.getAllFeedErrors = getAllFeedErrors;