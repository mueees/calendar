define([
    'app',
    'storage',
    './auth.service',
    'core/notify/notify.service',
    'core/url/url.service',
    'core/channel/channel.service'
], function (App, storage, $mAuth, $mNotify, $mUrl, $mChannel) {
    var afterAuth = null,
        signPage = null;

    $mChannel.on('ajax:error', errorHandler);

    function errorHandler(options) {
        $mNotify.notify({
            text: _generateText(options),
            type: 'danger'
        });

        if (options.status == 401) {
            logout();
            navigateToSign();
        }
    }

    function _generateText(options) {
        if (!options.response.message) {
            options.response.message = 'Unknown error';
        }

        return 'Status: ' + options.status + '. \n ' + options.response.message;
    }

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

    function signin(credentials) {
        $mAuth.signin(credentials).then(function () {
            $mNotify.notify({
                text: 'Sign in success',
                type: 'success'
            });

            navigateAfterSign();
        });
    }

    function signup(credentials) {
        $mAuth.signup(credentials).then(function () {
            $mNotify.notify({
                text: 'Please check your email'
            });
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
        signin: signin,
        signup: signup,
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