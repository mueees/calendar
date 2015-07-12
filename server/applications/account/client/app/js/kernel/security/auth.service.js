define([
    'jquery',
    './session.service',
    'kernel/resource/commands/user'
], function ($, $mSession, Commands) {
    function isAuth() {
        return $mSession.getSession();
    }

    function sign(credentials) {
        var command = Commands.get('sign'),
            promise = command.execute(credentials);

        promise.then(function (data) {
            data = data || {};

            if(data._id){
                // this is sign up

            } else if( data.token ){
                // this is sign in
                credentials.token = data.token;
                $mSession.create(credentials);
            }
        });

        return promise;
    }

    function logout() {
        $mSession.destroy();

        var command = Commands.get('logout');
        return $.when(command.execute());
    }

    return {
        isAuth: isAuth,
        sign: sign,
        logout: logout
    }
});