(function (w) {
    var applicationOauthKey = null,
        timeout = 1000 * 60 * 2, // 2 minute
        //provideServer = 'http://proxy.mue.in.ua/provide/',
        origin = 'http://localhost:10002',
        provideServer = 'http://localhost:10002/provide/',
        provide = null;

    function initialize(oauthKey) {
        if (oauthKey && !applicationOauthKey) {
            applicationOauthKey = oauthKey;
        }
    }

    function popup() {
        if (applicationOauthKey) {
            if (provide) {
                provide.reject();
                provide = null;
            }

            provide = new Provide();
            return provide.open();
        }
    }

    function Provide() {
        this.timeout = 1000 * 60; // on minute
        this.initialize();
    }

    Provide.prototype = {
        initialize: function () {
        },

        open: function () {
            var me = this;

            this.defer = $.Deferred();

            this.window = window.open(provideServer + applicationOauthKey);

            w.addEventListener("message", function (e) {
                me.receiveMessage(e);
            }, false);

            this.openTimeout = setTimeout(function () {
                me.reject('Timeout');
            }, timeout);

            this.openInterval = setInterval(function () {
                me.window.postMessage({
                    origin: window.location.origin,
                    host: window.location.host,
                    href: window.location.href
                }, '*');
            }, 500);

            this.windowClosedInterval = setInterval(function() {
                if(me.window.closed) {
                    me.reject('Window was closed');
                }
            }, 1000);

            return this.defer.promise();
        },

        reject: function (errorMessage) {
            this.clearOpenInterval();
            this.clearWindowClosedInterval();
            this.clearOpenTimeout();
            this.unSubscribeMessage();
            this.defer.reject({
                status: 500,
                message: errorMessage || 'Server error'
            });
        },

        unSubscribeMessage: function () {
            window.removeEventListener("message", this.receiveMessage, false);
        },

        clearWindowClosedInterval: function () {
            clearInterval(this.windowClosedInterval);
        },

        clearOpenInterval: function () {
            if(this.openInterval){
                clearInterval(this.openInterval);
                this.openInterval = null;
            }
        },

        clearOpenTimeout: function () {
            if (this.openTimeout) {
                clearTimeout(this.openTimeout);
                this.openTimeout = null;
            }
        },

        receiveMessage: function (event) {
            if (event.origin == origin) {
                this.clearOpenInterval();
                this.clearOpenTimeout();
                this.unSubscribeMessage();

                var data = JSON.parse(event.data);

                if( data.status == 200 ){
                    this.defer.resolve(data);
                }else{
                    this.defer.reject(data);
                }
            }
        }
    };

    w.Mue = {
        initialize: initialize,
        popup: popup
    };
})(window);