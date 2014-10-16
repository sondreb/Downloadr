// Generated on 2014-08-10 using generator-chromeapp 0.2.12
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    //require('grunt-bower-task');
    //require('grunt-bower-install');

    // Configurable paths
    var config = {
        app: 'app',
        service: 'srvc',
        dist: 'dist',
        tasks: grunt.cli.tasks
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            express: {
              files: [  '<%= config.service %>/*.js',
                        '<%= config.service %>/services/*.js',
                        '<%= config.service %>/routes/*.js',
                        '<%= config.service %>/views/*.jade' ],
              tasks: [
                      'express:dev'],
              options: {
                    livereload: true,
                    spawn: false}
            },
            test: {
              files: [
                        '<%= config.app %>/test/*.js',
                        '<%= config.service %>/test/*.js',
              ],
              tasks: ['mochacli'],
              options: { livereload: true }
            },
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['gruntfile.js']
            },
            styles: {
                files: ['<%= config.app %>/styles/{,*/}*.css'],
                tasks: [],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '.tmp/styles/{,*/}*.css',
                    '<%= config.app %>/css/*.css',
                    '<%= config.app %>/*.html',
                    '<%= config.app %>/views/*.html',
                    '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= config.app %>/manifest.json',
                    '<%= config.app %>/_locales/{,*/}*.json'
                ]
            }
        },

        express: {
            options: {
              // Override defaults here
              // Does this have any effect?
              baseUrl: '<%= config.service %>'
            },
            dev: {
              options: {
                script: '<%= config.service %>/server.js'
              }
            },
            prod: {
              options: {
                script: '<%= config.service %>/server.js',
                node_env: 'production'
              }
            },
            test: {
              options: {
                script: '<%= config.service %>/server.js'
              }
            }
          },

        // Grunt server and debug server settings
        connect: {
            options: {
                port: 9001,
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost',
                open: true,
            },
            server: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(config.app)
                        ];
                    }
                }
            },
            chrome: {
                options: {
                    open: false,
                    base: [
                        '<%= config.app %>'
                    ]
                }
            },
            test: {
                options: {
                    open: false,
                    base: [
                        'test',
                        '<%= config.app %>'
                    ]
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            server: '.tmp',
            chrome: '.tmp',
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },

        mochacli: {
            options: {
              reporter: "spec",
              ui: "tdd"
            },
            all: ["<%= config.service %>/test/*.js"]
        },

        // Automatically inject Bower components into the HTML file
        /*bowerInstall: {
            app: {
                src: ['<%= config.app %>/index.html'],
                ignorePath: '<%= config.app %>/'
            }
        },*/

        wiredep: {
          task: {
            // Point to the files that should be updated when
            // you run `grunt wiredep`
            src: [
              '<%= config.app %>/index.html'
            ],

            options: {
              // See wiredep's configuration documentation for the options
              // you may pass:

              // https://github.com/taptapship/wiredep#configuration
            }
          }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: [
                '<%= config.app %>/index.html'
            ]
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
            },
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: '{,*/}*.html',
                    dest: '<%= config.dist %>'
                }]
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //     dist: {
        //         files: {
        //             '<%= config.dist %>/styles/main.css': [
        //                 '.tmp/styles/{,*/}*.css',
        //                 '<%= config.app %>/styles/{,*/}*.css'
        //             ]
        //         }
        //     }
        // },
        // uglify: {
        //     dist: {
        //         files: {
        //             '<%= config.dist %>/scripts/scripts.js': [
        //                 '<%= config.dist %>/scripts/scripts.js'
        //             ]
        //         }
        //     }
        // },
        // concat: {
        //     dist: {}
        // },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.{webp,gif}',
                        '{,*/}*.html',
                        'styles/fonts/{,*/}*.*',
                        '_locales/{,*/}*.json',
                    ]
                },


                 {
                expand: true,
                dot: true,
                cwd: 'app/bower_components/font-awesome/fonts/',
                src: ['*.*'],
                dest: '<%= config.dist %>/fonts'
            }

                ]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= config.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            chrome: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin'
            ],
            test: [
                'copy:styles'
            ],
        },

        // Merge event page, update build number, exclude the debug script
        chromeManifest: {
            dist: {
                options: {
                    buildnumber: true,
                    background: {
                        target: 'scripts/background.js',
                        exclude: [
                            'scripts/chromereload.js'
                        ]
                    }
                },
                src: '<%= config.app %>',
                dest: '<%= config.dist %>'
            }
        },

        // Compress files in dist to make Chrome App package
        compress: {
            dist: {
                options: {
                    archive: function() {
                        var manifest = grunt.file.readJSON('app/manifest.json');
                        return 'package/FlickrDownloadr_' + manifest.version + '.zip';
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    //grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-mocha-cli");
    grunt.loadNpmTasks('grunt-express-server');

    grunt.registerTask('debug', function (platform) {

        var watch = grunt.config('watch');

        platform = platform || 'chrome';

        // Configure style task for debug:server task
        if (platform === 'server') {
            watch.styles.tasks = ['newer:copy:styles'];
            watch.styles.options.livereload = false;
        }

        // Configure updated watch task
        grunt.config('watch', watch);

        grunt.task.run([
            'clean:' + platform,
            'concurrent:' + platform,
            'mochacli',
            'express:dev',
            'connect:' + platform,
            'watch'
        ]);
    });

    grunt.registerTask('server', [
        'express:dev',
        'watch' ])

    grunt.registerTask('test', [
        'connect:test',
        'mochacli'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'chromeManifest:dist',
        'useminPrepare',
        'concurrent:dist',
        'concat',
        'cssmin',
        'uglify',
        'copy',
        'usemin',
        'htmlmin',
        'compress'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
