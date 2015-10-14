var MueRequest = require('./index'),
    app = 'rabbit',
    service = 'statistic';

function feedsStatistic() {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/statistic/feeds'
    });
}

function feedStatistic(feedId) {
    return MueRequest.request({
        app: app,
        service: service,
        method: 'GET',
        url: '/statistic/feeds/' + feedId
    });
}

function setLastUpdateDate(feedId){
    return MueRequest.request({
        app: app,
        service: service,
        method: 'POST',
        url: '/statistic/feeds/' + feedId + '/lastUpdateTime'
    });
}
exports.feedStatistic = feedStatistic;
exports.feedsStatistic = feedsStatistic;
exports.setLastUpdateDate = setLastUpdateDate;
