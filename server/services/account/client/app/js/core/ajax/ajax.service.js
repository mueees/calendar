define([
    'jquery',
    'core/notify/notify.service',
    'core/channel/channel.service'
], function ($, $mNotify, $mChannel) {
    function addPrefilter(preFilter) {
        $.ajaxPrefilter(preFilter);
    }

    function addErrorInterceptor(interceptor) {
        $(document).ajaxError(interceptor);
    }

    // auth error interceptor
    addErrorInterceptor(function (event, jqxhr, settings, thrownError) {
        $mChannel.trigger('ajax:error', {
            status: jqxhr.status,
            response: JSON.parse(jqxhr.responseText)
        });
    });

    return {
        addPrefilter: addPrefilter,
        addErrorInterceptor: addErrorInterceptor
    }
});