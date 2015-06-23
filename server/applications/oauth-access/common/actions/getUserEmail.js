var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    log = require('common/log')(module),
    BaseAction = require('common/actions/base');

function GetEmail(access_token){
    this.access_token = access_token;
}

util.inherits(GetEmail, BaseAction);

_.extend(GetEmail.prototype, {
    execute: function (callback) {
        request({
            url: 'http://localhost:6005/api/account/user',
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

module.exports = GetEmail;