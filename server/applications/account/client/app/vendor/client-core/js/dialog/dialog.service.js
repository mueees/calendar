define([
    'jquery',
    'clientCore/modal/modal.service',
    './prompt/prompt.view',
    './confirm/confirm.view'
], function ($, $mModal, PromptView, ConfirmView) {
    var defaultPrompt = {
        text: ''
    };

    var defaultConfirm = {
        accept: 'Ok',
        decline: 'Cancel',
        text: 'Default text'
    };

    function prompt(options) {
        var opt = _.extend(_.clone(defaultPrompt), options);

        var view = new PromptView({
            model: new Backbone.Model(opt)
        });

        $mModal.show(view);

        return view;
    }

    function confirm(options) {
        var def = $.Deferred();

        var opt = _.extend(_.clone(defaultConfirm), options);

        var view = new ConfirmView({
            model: new Backbone.Model(opt)
        });

        $mModal.show(view);

        view.on('accept', function () {
            view.trigger('closeWindow');
            def.resolve();
        });

        view.on('decline destroy', function () {
            view.trigger('closeWindow');
            def.reject();
        });

        return def.promise();
    }

    return {
        prompt: prompt,
        confirm: confirm
    }
});