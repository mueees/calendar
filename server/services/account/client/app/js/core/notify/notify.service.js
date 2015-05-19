define([], function () {
    function notify(text, options) {
        console.log(text);
    }

    return {
        notify: notify
    }
});