define([
    'storage',
    './auth.service'
], function (storage, $mAuth) {
    function isAuth() {
        return $mAuth.isAuth();
    }

    return {
        isAuth: isAuth
    }
});