define([
    'core/modal/modal.service',
    './prompt.view'
], function ($mModal, PromptView) {
    var defaultPrompt = {
        text: ''
    };

    function prompt(options){
        var opt = _.extend(_.clone(defaultPrompt), options);

        var view = new PromptView({
            model: new Backbone.Model(opt)
        });

        $mModal.show(view);

        return view;
    }

    return {
        prompt: prompt
    }
});