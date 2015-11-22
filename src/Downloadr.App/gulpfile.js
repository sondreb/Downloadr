'use strict';

var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    source = require('vinyl-source-stream'),
    $ = require('gulp-load-plugins')({ pattern: ['*'] });

var settings = {
    // This is the port for your proxied browser-synced website.
    // The Browser Sync UI is available on the port + 1 (e.g. 9102).
    reloadport: 7601,

    https: false,

    // Which browsers to launch upon start.
    browsers: ["google chrome"],

    webroot: 'www',

    srcroot: 'src',

    isProduction: false
};

// Prepare this outside of paths to avoid to much duplicate code.
var appSrcRoot = path.join(__dirname, 'src');
var appResRoot = path.join(__dirname, 'res');
var appWwwRoot = path.join(__dirname, 'www');
var appDistRoot = path.join(__dirname, 'dist');

var paths = {

    node: path.join(__dirname, 'node_modules'),

    source: {
        fonts: path.join(appResRoot, 'fonts'),
        root: appSrcRoot,
        module: path.join(appSrcRoot, 'app.module.js'),
        style: path.join(appSrcRoot, 'app.scss'),
        lib: {
            script: path.join(appSrcRoot, 'lib.js'),
            style: path.join(appSrcRoot, 'lib.scss')
        }
    },

    target: {
        root: path.join(appWwwRoot),
        libs: path.join(appWwwRoot, 'libs'),
        fonts: path.join(appWwwRoot, 'fonts'),
        modules: path.join(appWwwRoot, 'modules'),
        strings: path.join(appWwwRoot, 'strings'),
    }
};

gulp.task('default', function (callback) {
    $.runSequence('build', 'watch', 'serve', callback);
});

gulp.task('watch', ['watch:files', 'watch:views', 'watch:lib', 'watch:app']);
gulp.task('watch:app', ['watch:app:js', 'watch:app:css']);
gulp.task('build', ['build:files', 'build:lib', 'build:app']);
gulp.task('build:lib', ['build:lib:js', 'build:lib:css']);
gulp.task('build:app', ['build:app:js', 'build:app:css']);
gulp.task('build:files', ['copy:files', 'copy:views', 'copy:scripts', 'copy:resources', 'copy:images', 'copy:fonts']);

gulp.task('clean', function () {
    return $.del([appWwwRoot]);
});

gulp.task('run:electron', function() {
    return $.run('electron .').exec();
});

gulp.task('run:chrome', function() {
    console.log('Not implemented yet.');
});

gulp.task('package', function (callback) {
    $.runSequence('production', 'clean', 'build', 'package:chrome', callback);
});

gulp.task('production', function () {
    settings.isProduction = true;
});

gulp.task('package:atom', function() {
    
    return gulp.src('www/**')
        .pipe($.atomElectron({ version: '0.35.1', platform: 'win32' }))
        .pipe($.symdest('app'));
    
});

gulp.task('package:electron', function() {
    
    var packageJson = readConfiguration();
    
    gulp.src("")
    .pipe($.electron({
        src: './www',
        packageJson: packageJson,
        release: './release',
        cache: './cache',
        version: 'v0.35.1',
        packaging: true,
        platforms: ['win32-ia32', 'darwin-x64'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version,
                icon: 'gulp-electron.icns'
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'src/images/icons/downloadr.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
    
});

gulp.task('package:chrome', function () {

    var manifest = JSON.parse(fs.readFileSync(path.join(appSrcRoot, 'manifest.json')));
    var outputPath = path.join(appDistRoot, 'chrome');

    return gulp.src(appWwwRoot + '/**/*')
       .pipe($.zip('FlickrDownloadr_' + manifest.version + '.zip'))
       .pipe(gulp.dest(outputPath));

});

gulp.task('watch:app:js', function () {
    return gulp.watch(path.join(paths.source.root, '**/*.js'), ['build:app:js']);
});

gulp.task('watch:app:css', function () {
    return gulp.watch(path.join(paths.source.root, '**/*.scss'), ['build:app:css']);
});

gulp.task('watch:lib', function () {
    return gulp.watch([paths.source.lib.script, 'package.json'], ['build:lib']);
});

gulp.task('build:lib:css', function () {
    // Build the lib.css
    return gulp.src(paths.source.lib.style)
        .pipe($.sass())
        .pipe($.importCss()) // Imports the external .css files.
        .pipe($.concat('lib.css'))
        .pipe($.size({ showFiles: true }))
        .pipe($.if(!settings.isProduction, gulp.dest(paths.target.libs)))
        .pipe($.minifyCss({ keepBreaks: true }))
        .pipe($.rename({
            suffix: ".min"
        }))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(paths.target.libs))
        .on('error', $.util.log);
});

gulp.task('build:app:css', function () {
    // Build the lib.css
    return gulp.src(paths.source.style)
        .pipe($.sass())
        .pipe($.importCss()) // Imports the external .css files.
        .pipe($.concat('app.css'))
        .pipe($.size({ showFiles: true }))
        .pipe($.if(!settings.isProduction, gulp.dest(paths.target.libs)))
        .pipe($.minifyCss({ keepBreaks: true }))
        .pipe($.rename({
            suffix: ".min"
        }))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(paths.target.libs))
        .on('error', $.util.log);
});

// scripts task
gulp.task('scripts', ['lint'], function () {
    var b = $.browserify({
        entries: paths.scriptEntryFiles,
        debug: !settings.isProduction,
    });

    b.bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(paths.scriptDstDir))
});

gulp.task('build:test', ['build:test1', 'build:test2']);

gulp.task('build:lib:js', function () {

    var b = $.browserify('', {
        debug: false // Don't provide source maps for libs, doing so adds big size to unminified output.
    });

    b.require(listPackages());

    return b.bundle()
        .pipe(source('lib.js'))
        .pipe($.if(!settings.isProduction, gulp.dest(paths.target.libs)))
        .pipe($.vinylBuffer())
        .pipe($.uglify({
            outSourceMap: false
        }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.target.libs));

});

gulp.task('build:app:js', function () {

    var b = $.browserify(paths.source.module, {
        debug: !settings.isProduction
    });

    var transforms = [
        'brfs',
        'browserify-ngannotate'
    ];

    transforms.forEach(function (transform) {
        b.transform(transform);
    });

    b.external(listPackages());

    b.on('error', function (err) { console.error(err); })

    return b.bundle()
        .pipe(source('app.js'))

        // Don't output regular file when production is set.
        .pipe($.if(!settings.isProduction, gulp.dest(paths.target.libs)))
        .pipe($.vinylBuffer())
        .pipe($.uglify({
            outSourceMap: !settings.isProduction
        }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.target.libs));
});

gulp.task('build:js', function () {

    var b = $.browserify('lib.js', {
        debug: false // Don't provide source maps for libs, doing so adds big size to unminified output.
    });

    //b.require('angular', { expose: 'angular' });
    b.require('angular');

    return b.bundle()
        .pipe(source('lib.js'))
        .pipe(gulp.dest(paths.target.libs))
        .pipe($.vinylBuffer())
        .pipe($.uglify({
            outSourceMap: false
        }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.target.libs));

});

gulp.task('serve', function (callback) {
    var files = [
       paths.target.root + '**/*.html',
       paths.target.root + '**/*.css',
       paths.target.root + '**/*.png',
       paths.target.root + '**/*.js',
       paths.target.root + '**/*.svg'
    ];

    // If user have not overridden the weburl, use the one from hosting.ini.
    // var weburl = settings.weburl || readHostingFile();

    $.browserSync.init(files, {
        server: 'www',
        port: settings.reloadport,
        https: settings.https,
        ui: { port: (settings.reloadport + 1) },
        browser: settings.browsers || "google chrome"
    });

    callback();
});

gulp.task("copy:views", function () {
    // Copy all html files into view folder, ignoring index.html.
    return gulp.src([path.join(paths.source.root, '**/*.html'), '!' + path.join(paths.source.root, 'index.html')])
        .pipe(gulp.dest(path.join(paths.target.root, 'views')));
});

gulp.task('watch:views', function () {
    return gulp.watch([path.join(paths.source.root, '**/*.html'), '!' + path.join(paths.source.root, 'index.html')], ['copy:views']);
});

gulp.task("copy:files", function () {
    return gulp.src(filePaths()).pipe(gulp.dest(paths.target.root));
});

gulp.task('watch:files', function () {
    return gulp.watch(filePaths(), ['copy:files']);
});

gulp.task("copy:scripts", function () {

    return gulp.src([
        path.join(paths.source.root, 'scripts', 'main.js')]) // main Chrome App file.
         .pipe(gulp.dest(path.join(paths.target.root, 'scripts')));

});

gulp.task("copy:resources", function () {

    return gulp.src([
        path.join(paths.source.root, '_locales', '**/*')])
         .pipe(gulp.dest(path.join(paths.target.root, '_locales')));

});

gulp.task("copy:images", function () {

    return gulp.src([
        path.join(paths.source.root, 'images/**/*')])
         .pipe(gulp.dest(path.join(paths.target.root, 'images')));

});

gulp.task("copy:fonts", function () {

    return gulp.src([
        path.join(paths.source.fonts, '*.ttf')])
         .pipe(gulp.dest(paths.target.fonts));

});

function listPackages() {
    var json = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
    var packages = json.dependencies;
    var list = [];

    for (var attributename in packages) {
        list.push(attributename);
        //console.log(attributename + ": " + packages[attributename]);
    }

    return list;
};

function readConfiguration() {
    var file = fs.readFileSync(path.join(__dirname, 'gulpfile.json'));
    var json = JSON.parse(file);
    return json;
};

function filePaths() {

    var filePaths = [];
    var config = readConfiguration();

    if (config.files == undefined) {
        return filePaths;
    }

    config.files.forEach(function (value) {
        filePaths.push(path.join(paths.source.root, value));
    });

    return filePaths;

};

function onerror(err) {
    console.log(err);
    this.emit('end');
}