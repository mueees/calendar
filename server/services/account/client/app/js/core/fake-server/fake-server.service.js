define([
    'jquery',
    'mockajax'
], function ($) {
    function setHandler(options) {
        $.mockjax(options);
    }

    return {
        setHandler: setHandler
    }
});