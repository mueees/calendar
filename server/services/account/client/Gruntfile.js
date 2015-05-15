module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-jsvalidate');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-less');

    /*grunt.loadNpmTasks('grunt-svg-sprite');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-contrib-requirejs');*/

    var userConfig = require('./build.config.js');

    var taskConfig = {
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            app_assets: {
                files: [
                    {
                        src: ['**'],
                        dest: '<%= build_dir %>/app/assets',
                        cwd: 'app/assets',
                        expand: true,
                        flatten: false
                    }
                ]
            },
            app_js: {
                files: [
                    {
                        src: ['**'],
                        dest: '<%= build_dir %>/app/js',
                        cwd: 'app/js',
                        expand: true,
                        flatten: false
                    }
                ]
            },

            //vendor
            vendor_js: {
                files: [
                    {
                        src: ['<%= vendor_files.js %>'],
                        dest: '<%= build_dir %>',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            vendor_css: {
                files: [
                    {
                        src: ['<%= vendor_files.css %>'],
                        dest: '<%= build_dir %>/app/assets/css/vendor',
                        cwd: '.',
                        expand: true,
                        flatten: true
                    }
                ]
            },
            vendor_fonts: {
                files: [
                    {
                        src: ['<%= vendor_files.fonts %>'],
                        dest: '<%= build_dir %>/assets/fonts',
                        cwd: '.',
                        expand: true,
                        flatten: true
                    }
                ]
            }
        },
        stylus: {
            dev: {
                options: {
                    compress: false
                },
                files: {
                    '<%= build_dir %>/app/assets/css/default-<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.stylus.default %>'
                }
            }
        },
        less: {
            dev: {
                options: {
                    paths: ["assets/css"]
                },
                files: {
                    "<%= build_dir %>/app/assets/css/default-<%= pkg.name %>-<%= pkg.version %>.css": '<%= app_files.less.default %>'
                }
            }
        },
        clean: {
            build: [
                '<%= build_dir %>'
            ],
            assets_build: [
                '<%= build_dir %>/assets'
            ]
        },
        watch: {
            app_js: {
                files: [
                    '<%= app_files.js %>',
                    '<%= app_files.templates %>'
                ],
                tasks: ['copy:app_js']
            },
            assets: {
                files: ['app/assets/**'],
                tasks: ['clean:assets_build', 'copy:app_assets', 'copy:vendor_css', 'copy:vendor_fonts', 'less:dev']
            },
            less: {
                files: ['app/**/*.less'],
                tasks: ['less:dev']
            }
        },
        requirejs: {
            development: {
                options: {
                    baseUrl: 'app/js',
                    name: 'pages/index',
                    include: ['ux-core'],
                    out: 'out.js',
                    optimize: 'none'
                }
            }
        }
    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    grunt.registerTask("development", [
        'clean:build',

        'copy:app_js',
        'copy:app_assets',

        'less:dev',

        'copy:vendor_css',
        'copy:vendor_js',
        'copy:vendor_fonts'

    ]);

    grunt.registerTask('debug', 'Main task for development', function () {
        grunt.task.run('development');
        grunt.task.run('watch');
    });
};