define([], function () {
    function setTitle(title) {
        window.document.title = title;
    }

    function getTitle() {
        return window.document.title;
    }

    return {
        getTitle: getTitle,
        setTitle: setTitle
    }
});