module.exports = {
    build_dir: 'build',
    compile_dir: 'bin',
    compile_dir_scripts_temp: 'bin/scripts/temp',

    app_files: {
        js: [
            'app/js/**/*.js'
        ],
        templates: [
            'app/js/**/*.html',
            'app/js/**/*.hbs'
        ],
        stylus: {
            default: 'app/stylus/default.styl'
        },
        less: {
            default: 'app/less/default.less'
        }
    },

    vendor_files: {
        js: [
            'app/vendor/requirejs/require.js',
            'app/vendor/requirejs/text.js',
            'app/vendor/jquery/dist/jquery.js',
            'app/vendor/jquery-mockjax-2.0.0-beta/mockajax.js',
            'app/vendor/underscore-1.8.3/underscore.js',
            'app/vendor/bootstrap/dist/js/bootstrap.js',
            'app/vendor/handlebars-0.11.2/handlebars.js',
            'app/vendor/marionette/marionette.js',
            'app/vendor/backbone/backbone.js',
            'app/vendor/backbone/backbone_clear.js',
            'app/vendor/backbone/backbone.babysitter.js',
            'app/vendor/backbone/backbone.queryparam.js',
            'app/vendor/backbone/backbone.routefilter.js',
            'app/vendor/backbone/backbone.server.js',
            'app/vendor/backbone/backbone.stickit.js',
            'app/vendor/backbone/backbone.syphon.js',
            'app/vendor/backbone/backbone.validation.js',
            'app/vendor/backbone/backbone.wreqr.js',
            'app/vendor/storage/storage.js'
        ],
        css: [
            'app/vendor/bootstrap/dist/css/bootstrap.css'
        ],
        fonts: [],
        assets: []
    }
};