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
            w.addEventListener("message", me.receiveMessage, false);

            this.start = new Date();
            this.openTimeout = setTimeout(function () {
                me.reject();
            }, timeout);

            setInterval(function () {
                //w.postMessage('Hi', 'http://localhost:6006');
            }, 100);

            return this.defer.promise();
        },

        reject: function () {
            this.clearOpenTimeout();
            this.unSubscribeMessage();
            this.defer.reject();
        },

        unSubscribeMessage: function () {
            window.removeEventListener("message", me.receiveMessage, false);
        },

        clearOpenTimeout: function () {
            if (this.openTimeout) {
                clearTimeout(this.openTimeout);
            }
        },

        receiveMessage: function (event) {
            console.log(event);

            if (event.origin == origin) {
                this.clearOpenTimeout();
                this.unSubscribeMessage();

                this.resolve(JSON.parse(event.data));
            }
        }
    };

    w.Mue = {
        initialize: initialize,
        popup: popup
    };
})(window);