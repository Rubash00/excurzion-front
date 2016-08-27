'use strict';

var gulp      = require('gulp'),
    webserver = require('gulp-webserver'),
    connect   = require('gulp-connect'),
    stylus    = require('gulp-stylus'),
    nib       = require('nib'),
    jshint    = require('gulp-jshint'),
    stylish   = require('jshint-stylish'),
    inject    = require('gulp-inject'),
    wiredep   = require('wiredep').stream,
    gulpif    = require('gulp-if'),
    minifyCSS = require('gulp-minify-css'),
    cleanCSS  = require('gulp-clean-css'),
    useref    = require('gulp-useref'),
    uglify    = require('gulp-uglify'),
    uncss     = require('gulp-uncss'),
    imagemin  = require('gulp-imagemin'),
    angularFilesort = require('gulp-angular-filesort'),
    historyApiFallback = require('connect-history-api-fallback');

var path = {
	root : 'app',
	dist : 'dist'
};

// Server [ Development ]
gulp.task('server', function() {
  gulp.src( path.root )
    .pipe(webserver({
      port       : 3000,
      livereload : true,
      fallback   : 'index.html'
    }));
});

// Server [ Production ]
gulp.task('server-dist', function() {
  gulp.src( path.dist )
    .pipe(webserver({
      port       : 3000,
      livereload : true,
      fallback   : 'index.html',
    }));
});

// JSHint [ Errors ]
gulp.task('jshint', function() {
  return gulp.src('./app/js/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Preprocessor [ Stylus --> CSS ]
gulp.task('css', function() {
  gulp.src('./app/stylesheets/main.styl')
    .pipe(stylus({ use: nib() }))
    .pipe(gulp.dest('./app/stylesheets'))
    .pipe(connect.reload());
});

// Browser Reload 
gulp.task('html', function() {
  gulp.src('./app/**/*.html')
    .pipe(connect.reload());
});

// Image Minify 
gulp.task('imagemin' ,function() {
  gulp.src('./app/assets/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./app/dist/assets'))
});

// Inject [ JS & CSS ]
gulp.task('inject', function() {
  return gulp.src('index.html', {cwd: './app'})
    .pipe(inject(
      gulp.src(['./app/js/**/*.js']).pipe(angularFilesort()), {
      ignorePath: '/app'
    }))
    .pipe(inject(
      gulp.src(['./app/stylesheets/**/*.css']), {
        ignorePath: '/app'
      }
    ))
    .pipe(gulp.dest('./app'));
});

// Inject [ Bower ]
gulp.task('wiredep', function() {
  gulp.src('./app/index.html')
    .pipe(wiredep({
    	directory: './app/lib'
    }))
    .pipe(gulp.dest('./app'));
});

// Compress [ JS & CSS ]
gulp.task('compress', function() {
  gulp.src('./app/index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify({ mangle: false })))
    .pipe(gulpif('*.css', cleanCSS()))
    .pipe(cleanCSS({debug: true}, function(details) {
      console.log(details.name + ': ' + details.stats.originalSize);
      console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe(gulp.dest('./dist'));
});

// Removing Weight [ CSS ]
gulp.task('uncss', function() {
  gulp.src('./dist/css/style.min.css')
    .pipe(uncss({
      html: ['./app/index.html']
    }))
    .pipe(gulp.dest('./dist/css'));
});

// Copying Static Content [ Removing Comments ]
gulp.task('copy', function() {
  gulp.src('./app/index.html')
    .pipe(useref())
    .pipe(gulp.dest('./dist'));
  gulp.src('./app/lib/fontawesome/fonts/**')
    .pipe(gulp.dest('./dist/fonts'));
});

// Watching for Changes [ HTML, CSS & JS ]
gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html'], ['html']);
  gulp.watch(['./app/assets/*'], ['imagemin']);
  gulp.watch(['./app/stylesheets/**/*.styl'], ['css', 'inject']);
  gulp.watch(['./app/js/**/*.js', './Gulpfile.js'], ['inject']);
  gulp.watch(['./bower.json'], ['wiredep']);
});

gulp.task('default', ['server', 'inject', 'wiredep', 'watch']);
gulp.task('build', ['compress', 'copy', 'uncss']);

