define([
    'storage'
], function (storage) {
    var sessionName = 'user';

    function create(credentials) {
        storage.set(sessionName, {
            email: credentials.email,
            token: credentials.email,
        });
    }

    function destroy() {
        storage.set(sessionName, null);
    }

    function getSession(){
        return storage.get(sessionName);
    }

    return {
        create: create,
        destroy: destroy,
        getSession: getSession
    }
});