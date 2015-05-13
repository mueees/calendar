define([
    'app',
    'marionette'
], function (App, Marionette) {
    App.module('Components.Menu', {
        define: function (Menu) {
            var Controller = Marionette.Controller.extend({});
            Menu.Controller = Controller;
        }
    });
});