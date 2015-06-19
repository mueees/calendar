define([
    'backbone',
    'underscore',
    './notify.view'
], function (Backbone, _, View) {
    var container;

    var defaultOptions = {
        text: 'Default text',
        type: 'info',
        autoHide: true,
        hideTimeout: 3000
    };

    function notify(options) {
        if (container) {
            var opt = _.extend(_.clone(defaultOptions), options),
                view = new View({
                    model: new Backbone.Model(opt)
                });

            container.prepend(view.$el);

            if (opt.autoHide) {
                setTimeout(function () {
                    view.remove();
                }, opt.hideTimeout);
            }
        } else {
            console.log("Cannot find container");
        }
    }

    function clear() {
        if (container) {
            container.html('');
        }
    }

    function setContainer(el) {
        container = el;
    }

    function setDefaultOptions(options) {
        defaultOptions = _.extend(defaultOptions, options);
    }

    return {
        notify: notify,
        clear: clear,
        setContainer: setContainer,
        setDefaultOptions: setDefaultOptions
    }
});