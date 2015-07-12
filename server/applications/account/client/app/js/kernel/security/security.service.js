define([
    'app',
    'storage',
    './auth.service',
    'core/notify/notify.service',
    'core/url/url.service',
    'clientCore/ajax/ajax.service'
], function (App, storage, $mAuth, $mNotify, $mUrl, $mAjax) {
    var afterAuth = null,
        signPage = null;

    $mAjax.addErrorInterceptor(function(event, jqxhr){
        var response;

        try {
            response = JSON.parse(jqxhr.responseText);
        } catch (e) {
            response = {
                message: 'Unknown error'
            }
        }

        if (jqxhr.status == 401) {
            logout();
            navigateToSign();
        }

        $mNotify.notify({
            text: 'Status: ' + jqxhr.status + '. \n ' + response.message,
            type: 'danger'
        });
    });

    $mAjax.addPrefilter(function (options, originalOptions, xhr) {
        var auth = isAuth();

        if (auth) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + auth.token);
        }
    });

    function isAuth() {
        return $mAuth.isAuth();
    }

    function getAfterAuth() {
        return afterAuth;
    }

    function setAfterAuth(data) {
        afterAuth = data;
    }

    function clearAfterAuth() {
        afterAuth = null;
    }

    function setSignPage(data) {
        signPage = data;
    }

    function getSignPage() {
        return signPage;
    }

    function navigateToSign(route, name, access) {
        App.navigate('#' + signPage.fragment, {
            trigger: true
        });
    }

    function navigateAfterSign() {
        var url = $mUrl.toFragment(afterAuth.fragment, afterAuth.query);
        App.navigate('#' + url, {
            trigger: true
        });
    }

    function sign(credentials){
        $mAuth.sign(credentials).then(function (data) {
            if(data._id){
                $mNotify.notify({
                    text: 'Please check your email'
                });
            } else if( data.token ){
                $mNotify.notify({
                    text: 'Sign in success',
                    type: 'success'
                });

                navigateAfterSign();
            }
        });
    }

    function logout() {
        $mNotify.notify({
            text: 'Logout success',
            type: 'success'
        });

        $mAuth.logout();

        App.navigate('#' + signPage.fragment, {
            trigger: true
        });
    }

    return {
        sign: sign,
        logout: logout,
        isAuth: isAuth,
        getSignPage: getSignPage,
        setSignPage: setSignPage,
        getAfterAuth: getAfterAuth,
        setAfterAuth: setAfterAuth,
        clearAfterAuth: clearAfterAuth,
        navigateToSign: navigateToSign,
        navigateAfterSign: navigateAfterSign
    }
});