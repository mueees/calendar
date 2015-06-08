define([
    'bootstrap'
], function ($) {
    var container;

    function setContainer(el) {
        var me = this;

        container = el;

        container.addClass('modal fade');

        container.on('hidden.bs.modal', function () {
            if (me.view) {
                me.view.destroy();
            }

            container.html('');
        });
    }

    function show(view) {
        this.view = view;

        view.on("closeWindow", hide);
        container.append(view.render().$el);
        container.modal('show');
    }

    function hide() {
        container.modal('hide');
        this.view = null;
    }

    return {
        setContainer: setContainer,
        show: show,
        hide: hide
    }
});