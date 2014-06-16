'use strict';

var LIVERELOAD_PORT = 35730;

var lrSnippet = require( 'connect-livereload' )({
    port: LIVERELOAD_PORT
});

var mountFolder = function ( connect, dir ) {
    return connect.static( require( 'path' ).resolve( dir ) );
};

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    shell: {
      options : {
        stdout: true
      },
      npm_install: {
        command: 'npm install'
      },
      upm_install:
      {
        command: 'upm'
      }
    },

    connect: {
      options: {
        port: 8383,
        hostname: 'localhost',
        base: 'app/'
      },
      livereload: {
        options: {
          middleware: function(connect)
          {
            return [lrSnippet, mountFolder(connect, 'app')];
          }
        }
      }
      /*,
      webserver: {
        options: {
          port: 8888,
          keepalive: true
        }
      },
      devserver: {
        options: {
          port: 8888
        }
      },
      testserver: {
        options: {
          port: 9999
        }
      },
      coverage: {
        options: {
          base: 'coverage/',
          port: 5555,
          keepalive: true
        }
      }*/
    },

    open: {
      livereload: {
        path: 'http://localhost:8383'
      },
      devserver: {
        path: 'http://localhost:8888'
      },
      coverage: {
        path: 'http://localhost:5555'
      }
    },

    karma: {
      unit: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: false,
        singleRun: true
      },
      unit_auto: {
        configFile: './test/karma-unit.conf.js'
      },
      midway: {
        configFile: './test/karma-midway.conf.js',
        autoWatch: false,
        singleRun: true
      },
      midway_auto: {
        configFile: './test/karma-midway.conf.js'
      },
      e2e: {
        configFile: './test/karma-e2e.conf.js',
        autoWatch: false,
        singleRun: true
      },
      e2e_auto: {
        configFile: './test/karma-e2e.conf.js'
      }
    },

    watch: {
      assets: {
        files: ['app/css/**/*.css','app/js/**/*.js'],
        tasks: ['concat']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: ['app/index.html',
                    'app/views/*.html',
                    'app/css/*.css',
                    'app/js/{,*/}*.js',
                    'app/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'],
        tasks: ['concat']
      }
    },

    concat: {
      styles: {
        dest: './app/assets/app.css',
        src: [
          'app/angular-csp.css',
          'app/css/font-awesome.min.css',
          'app/css/hotkeys.css',
          'app/css/app.css'
        ]
      },
      scripts: {
        options: {
          separator: ';'
        },
        dest: './app/assets/app.js',
        src: [
          'app/js/jquery.js',
          'app/js/angular-signalr.js',
          'app/js/angular.js',
          'app/js/angular-route.js',
          'app/js/angular.safeapply.js',
          'app/js/mousetrap.js',
          'app/js/hotkeys.js',

          'app/js/flickr.js',
          
          'app/js/app.js',
          'app/js/controllers.js',
          'app/js/directives.js',
          'app/js/services.js',
          'app/js/filters.js',

        ]
      }
    }
  });

  grunt.registerTask('test', ['connect:testserver','karma:unit','karma:midway', 'karma:e2e']);
  grunt.registerTask('test:unit', ['karma:unit']);
  grunt.registerTask('test:midway', ['connect:testserver','karma:midway']);
  grunt.registerTask('test:e2e', ['connect:testserver', 'karma:e2e']);

  //keeping these around for legacy use
  grunt.registerTask('autotest', ['autotest:unit']);
  grunt.registerTask('autotest:unit', ['connect:testserver','karma:unit_auto']);
  grunt.registerTask('autotest:midway', ['connect:testserver','karma:midway_auto']);
  grunt.registerTask('autotest:e2e', ['connect:testserver','karma:e2e_auto']);

  //installation-related
  grunt.registerTask('install', ['shell:npm_install','shell:upm_install']);

  //defaults
  grunt.registerTask('default', ['dev']);

  //development
  //grunt.registerTask('dev', ['install', 'concat', 'connect:devserver', 'connect:livereload', 'open:devserver', 'watch:assets']);
  grunt.registerTask('dev', ['install', 'concat', 'connect:devserver', 'watch:assets']);

  grunt.registerTask('live', ['concat', 'connect:livereload', 'open:livereload', 'watch:livereload']);

  //server daemon
  grunt.registerTask('serve', ['connect:webserver']);
};
