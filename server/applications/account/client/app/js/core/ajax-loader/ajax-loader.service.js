define([
    'clientCore/ajax/ajax.service'
], function ($mAjax) {
    $mAjax.addPrefilter(function (options, originalOptions, xhr) {
        console.log('loading start');

        xhr.complete(function () {
            console.log('loading done');
        });
    });
});