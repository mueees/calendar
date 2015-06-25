var data = data || {};

window.addEventListener('message', function (e) {
    if(e.origin == 'http://localhost:63342'){
        e.source.postMessage(JSON.stringify(data), "*");
    }
}, false);