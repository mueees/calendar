define([
    'clientCore/ajax/ajax.service',
    './ajax-loader.view'
], function ($mAjax, AjaxLoaderView) {
    var view = (new AjaxLoaderView()).render(),
        $body = $('body');

    $mAjax.addPrefilter(function (options, originalOptions, xhr) {
        $body.append(view.$el);

        xhr.complete(function () {
            $body.find('.mue-spinner').remove();
        });
    });
});