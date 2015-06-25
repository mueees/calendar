(function (w) {
    var applicationOauthKey = null,
        timeout = 1000 * 60 * 2, // 2 minute
        origin = 'http://localhost:6006',
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

            this.window = window.open('http://localhost:6006/provide/' + applicationOauthKey);
            w.addEventListener("message", function (e) {
                me.receiveMessage(e);
            }, false);

            this.start = new Date();
            this.openTimeout = setTimeout(function () {
                me.reject();
            }, timeout);

            this.openInterval = setTimeout(function () {
                me.window.postMessage('hi', '*');
            }, 500);

            return this.defer.promise();
        },

        reject: function () {
            this.clearOpenInterval();
            this.clearOpenTimeout();
            this.unSubscribeMessage();
            this.defer.reject();
        },

        unSubscribeMessage: function () {
            window.removeEventListener("message", this.receiveMessage, false);
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