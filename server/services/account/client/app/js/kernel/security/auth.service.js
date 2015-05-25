define([
    'jquery',
    './session.service',
    'kernel/resource/commands/user'
], function ($, $mSession, Commands) {
    function isAuth() {
        return $mSession.getSession();
    }

    function signin(credentials) {
        var command = Commands.get('signin');

        return command.execute(credentials).then(function (data) {
            credentials.token = data.token;
            $mSession.create(credentials);
        });
    }

    function signup(credentials) {
        var command = Commands.get('signup');
        return command.execute(credentials);
    }

    function logout() {
        $mSession.destroy();

        var command = Commands.get('logout');
        return $.when(command.execute());
    }

    return {
        isAuth: isAuth,
        signup: signup,
        signin: signin,
        logout: logout
    }
});