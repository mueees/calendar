define([
    'bootstrap'
], function ($) {
    var container;

    function setContainer(el) {
        container = el;
    }

    function show(view){
        this.view = view;

        view.on("closeWindow", hide);
        container.append(view.render().$el);
        view.$el.modal('show');
    }

    function hide(){
        this.view.$el.modal('hide');
        this.view = null;
    }

    return {
        setContainer: setContainer,
        show: show,
        hide: hide
    }
});