var MueRequest = require('./index'),
    app = 'rabbit',
    statisticService = 'statistic',
    apiService = 'api';

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

exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.deleteCategory = deleteCategory;
exports.feedStatistic = feedStatistic;
exports.feedsStatistic = feedsStatistic;
exports.setLastUpdateDate = setLastUpdateDate;
