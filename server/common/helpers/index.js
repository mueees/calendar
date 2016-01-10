var _ = require('lodash');

var util = {
    getUUID: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    },

    cutUrlSlash: function (url) {
        if (_.endsWith(url, '/')) {
            url = url.slice(0, -1);
        }

        return url;
    }
};

exports.util = util;