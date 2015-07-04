var response = response || {},
    meta = meta || {};

function sendResponse(e){
    e.source.postMessage(JSON.stringify(response), "*");
    window.close();
}

window.addEventListener('message', function (e) {
    if( meta.domain ){
        if(e.origin == meta.domain){
            sendResponse(e);
        }
    } else {
        sendResponse(e);
    }

    setTimeout(function () {
        window.close();
    }, 1000 * 10);
}, false);