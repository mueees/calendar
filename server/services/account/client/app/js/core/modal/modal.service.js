define([
    'bootstrap'
], function ($) {
    var container;

    function setContainer(el) {
        container = el;
    }

    function show(view){
        view.on("closeWindow", hide);
        container.append(view.render().$el);
        container.modal('show');
    }

    function hide(){
        container.modal('hide');
    }

    return {
        setContainer: setContainer,
        show: show,
        hide: hide
    }
});