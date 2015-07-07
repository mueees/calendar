define([
    'jquery',
    'core/notify/notify.service',
    'core/ajax/ajax.service',
    'core/channel/channel.service'
], function ($, $mNotify, $mAjax, $mChannel) {
    $mAjax.addPrefilter(function(options, originalOptions, jqXHR){
        options.contentType = 'application/json';
    });
});