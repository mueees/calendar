define([
    'jquery'
], function ($) {
    function addPrefilter(preFilter) {
        $.ajaxPrefilter(preFilter);
    }

    function addErrorInterceptor(interceptor) {
        $(document).ajaxError(interceptor);
    }

    return {
        addPrefilter: addPrefilter,
        addErrorInterceptor: addErrorInterceptor
    }
});