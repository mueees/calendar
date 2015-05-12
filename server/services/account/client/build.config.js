module.exports = {
    build_dir: 'build',
    compile_dir: 'bin',
    compile_dir_scripts_temp: 'bin/scripts/temp',

    app_files: {
        stylus: {
            default: 'app/stylus/default.styl'
        }
    },

    vendor_files: {
        js: [
            'app/vendor/requirejs/require.js',
            'app/vendor/requirejs/text.js',
            'app/vendor/jquery/dist/jquery.js',
            'app/vendor/underscore-1.8.2/underscore.js'
        ],
        css: [
            'app/vendor/bootstrap/dist/css/bootstrap.css'
        ],
        fonts: [],
        assets: []
    }
};