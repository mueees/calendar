define([
    'jquery',
    'core/notify/notify.service'
], function ($, $mNotify) {

    function addPrefilter(preFilter) {
        $.ajaxPrefilter(preFilter);
    }

    function addErrorInterceptor(interceptor) {
        $(document).ajaxError(interceptor);
    }

    addErrorInterceptor(function (event, jqxhr, settings, thrownError) {
        $mNotify.notify(thrownError);
    });

    return {
        addPrefilter: addPrefilter,
        addErrorInterceptor: addErrorInterceptor
    }
});