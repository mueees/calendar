define([
    'app',
    'storage'
], function (App, storage) {
    return App.module('Core.Security', {
        define: function (Security) {

            function create(credentials){
                storage.set('user', {
                    email: credentials.email,
                    token: credentials.email,
                })
            }
            function remove(){}

            Security.Session = {
                create: create,
                remove: remove
            };

        }
    });
});