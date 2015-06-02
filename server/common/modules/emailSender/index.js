var nodemailer = require("nodemailer"),
    _ = require("underscore"),
    Q = require('q'),
    config = require("configuration");

function EmailSender(options){
    this.options = options;

    this.smtpTransport = nodemailer.createTransport({
        service: config.get("emailSender:service"),
        auth: {
            user: config.get("emailSender:auth:user"),
            pass: config.get("emailSender:auth:pass")
        }
    });

    this.mailOptions = {
        from: this.options.from || config.get("email:default:from"),
        to: this.options.to || config.get("email:list").join(','),
        subject: this.options.subject || config.get("email:default:subject")
    };

    if( this.options.text ){
        this.mailOptions.text = this.options.text;
    }else if( this.options.body ){
        this.mailOptions.body = this.options.body;
    }else if( this.options.html ){
        this.mailOptions.html = this.options.html;
    }else{
        this.mailOptions.text = "no text or body...";
    }
}

_.extend(EmailSender.prototype, {
    send: function(){
        var me = this,
            def = Q.defer();

        this.smtpTransport.sendMail(this.mailOptions, function(err){
            if(err){
                return; def.reject(err);
            }

            def.resolve();
            me.smtpTransport.close();
        });

        return def.promise;
    }
});

module.exports = EmailSender;