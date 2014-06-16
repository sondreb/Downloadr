module.exports = function() {
  return {
    basePath: '../',
    frameworks: ['mocha'],
    reporters: ['progress'],
    browsers: ['Chrome'],
    autoWatch: true,

    // these are default values anyway
    singleRun: false,
    colors: true,
    
    files : [
      //3rd Party Code
      'app/js/angular.js',
      'app/js/angular-route.js',
      'app/js/angular-safeapply.js',
      'app/js/lib/router.js',

      //App-specific Code
      'app/js/config/config.js',
      'app/js/services/**/*.js',
      'app/js/directives/**/*.js',
      'app/js/controllers/**/*.js',
      'app/js/filters/**/*.js',
      'app/js/config/routes.js',
      'app/js/app.js',

      //Test-Specific Code
      'app/test/chai.js',
      'test/lib/chai-should.js',
      'test/lib/chai-expect.js'
    ]
  }
};
