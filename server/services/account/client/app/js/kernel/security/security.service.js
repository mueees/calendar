define([
    'storage',
    './auth.service'
], function (storage, $mAuth) {
    var afterAuth = null,
        signPage = null;

    function isAuth() {
        return $mAuth.isAuth();
    }

    function getAfterAuth(){
        return afterAuth;
    }

    function setAfterAuth(data){
        afterAuth = data;
    }

    function clearAfterAuth(){
        afterAuth = null;
    }

    function setSignPage(data){
        signPage = data;
    }

    function getSignPage(){
        return signPage;
    }

    return {
        isAuth: isAuth,
        setAfterAuth: setAfterAuth,
        getAfterAuth: getAfterAuth,
        clearAfterAuth: clearAfterAuth,
        setSignPage: setSignPage,
        getSignPage: getSignPage
    }
});