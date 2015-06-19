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
        var response;

        try {
            response = JSON.parse(jqxhr.responseText);
        } catch (e) {
            response = {
                message: 'Unknown error'
            }
        }

        $mChannel.trigger('ajax:error', {
            status: jqxhr.status,
            response: response
        });
    });

    return {
        addPrefilter: addPrefilter,
        addErrorInterceptor: addErrorInterceptor
    }
});