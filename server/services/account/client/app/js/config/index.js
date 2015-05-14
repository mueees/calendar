requirejs.config({
    baseUrl: 'js/',
    paths: {
        app: 'apps/base',
        components: 'core/components',

        marionette: '../vendor/marionette/marionette',
        backbone: "../vendor/backbone/backbone",
        "backbone.wreqr": "../vendor/backbone/backbone.wreqr",
        "backbone.babysitter": "../vendor/backbone//backbone.babysitter",
        "backbone.server": "../vendor/backbone/backbone.server",
        "backbone.queryparam": "../vendor/backbone/backbone.queryparam",
        "backbone.routefilter": "../vendor/backbone/backbone.mueRoutefilter",
        "backbone.validation": "../vendor/backbone/backbone.validation",
        "backbone.stickit": "../vendor/backbone/backbone.stickit",
        "backbone.syphon": "../vendor/backbone/backbone.syphon",

        underscore: "../vendor/underscore-1.8.3/underscore",
        jquery: "../vendor/jquery/dist/jquery",

        text: '../vendor/requirejs/text'
    },
    shim: {
        jquery: {
            exports: "jQuery"
        },
        underscore: {
            exports: "_"
        }
    }
});