var response = response || {},
    meta = meta || {};

function sendResponse(e) {
    e.source.postMessage(JSON.stringify(response), "*");
    setTimeout(function () {
        window.close();
    }, 100);
}

window.addEventListener('message', function (e) {
    // if it's localhost
    if (e.origin.indexOf('localhost') != -1) {
        sendResponse(e);
    } else {
        if (meta.domain) {
            if (meta.domain.indexOf('mue.in.ua') != -1) {
                sendResponse(e);
            } else if (e.origin == meta.domain) {
                sendResponse(e);
            }
        }
    }

    setTimeout(function () {
        window.close();
    }, 1000 * 10);
}, false);