module.exports = {
    build_dir: 'build',
    compile_dir: 'bin',
    compile_dir_scripts_temp: 'bin/scripts/temp',

    app_files: {
        js: {
            html: [
                'app/index.html'
            ]
        },

        stylus: {
            default: 'app/stylus/default.styl',
            dark: 'app/stylus/dark.styl'
        },

        html: 'app/index.html'
    },

    vendor_files: {
        js: [],
        css: [
            'app/vendor/bootstrap/dist/css/bootstrap.css'
        ],
        fonts: [
            'app/vendor/bootstrap/fonts/*'
        ],
        assets: []
    }
};