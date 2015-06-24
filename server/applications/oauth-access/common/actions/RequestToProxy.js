var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    log = require('common/log')(module),
    BaseAction = require('common/actions/base');

function RequestToProxy(data){
    this.version = data.version;
    this.application = data.application;
}

util.inherits(RequestToProxy, BaseAction);

_.extend(RequestToProxy.prototype, {
    execute: function (callback) {
        request({
            url: 'http://localhost:6005/api/v1/account/user',
            headers: {
                'Authorization': 'Bearer ' + this.access_token,
                'X-Requested-With': 'XMLHttpRequest'
            }
        }, function (err, response, data) {
            if(err){
                log.error(err.message);
                callback(err);
            }

            callback(null, JSON.parse(data).email);
        });
    }
});

module.exports = RequestToProxy;