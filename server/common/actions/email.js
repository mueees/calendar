var BaseModel = require('./base'),
    util = require('util'),
    EmailSender = require("common/modules/emailSender/index"),
    config = require("configuration"),
    path = require("path"),
    async = require('async'),
    jade = require('jade'),
    _ = require('underscore');

function EmailAction(options){
    var defaultOption = {
        subject: config.get("email:default:subject"),
        from: config.get("email:default:from"),
        data: null
    };

    options.template = '../../../' + options.template;
    this.settings = _.extend(defaultOption , options);
}

util.inherits(EmailAction, BaseModel);

_.extend(EmailAction.prototype, {
    _makeHtml: function(cb){
        this.settings.html = jade.renderFile(this.settings.template, this.settings.data);
        cb(null);
    },

    _send: function(cb){
        var _this = this,
            emailSender = new EmailSender(_this.settings);

        emailSender.send().then(function () {
            cb(null);
        });
    },

    execute: function(callback){
        async.waterfall([
            this._makeHtml.bind(this),
            this._send.bind(this)
        ], function(err){
            if(err){
                if(callback) callback(err);
                return false;
            }
            if(callback) callback(null);
        });
    }
});

module.exports = EmailAction;