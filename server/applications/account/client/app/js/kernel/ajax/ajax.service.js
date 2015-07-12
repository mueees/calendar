define([
    'jquery',
    'clientCore/notify/notify.service',
    'clientCore/ajax/ajax.service'
], function ($, $mNotify, $mAjax) {
    $mAjax.addPrefilter(function(options, originalOptions, jqXHR){
        options.contentType = 'application/json';
    });
});