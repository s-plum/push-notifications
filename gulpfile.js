var gulp = require('gulp'),
    argv = require('yargs').argv,
    autoprefixer = require('gulp-autoprefixer'),
    browserify = require('browserify'),
    compass = require('gulp-compass'),
    del = require('del'),
    fs = require('fs'),
    gulpIf = require('gulp-if'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
    plumber = require('gulp-plumber'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    webserver = require('gulp-webserver');

//erro handling
var onError = function (err) {  
  console.log(err.toString());
};

//JSHint configuration
var jsHintConfig = {
  loopfunc: true,
  predef: ['define','require'],
  devel: true,
  browser: true
};

var env = argv.env || argv.e || 'dev',
    shouldMinify = argv.minify,
    shouldWatch = argv.watch;

var buildTasks = ['scripts', 'copy', 'sassy', 'images'];

if (shouldWatch) {
    buildTasks.push('watch');
}
 
gulp.task('watch:scripts', function() {
  watch(['src/js/**/*.js', '!src/js/plugins/**/*.js'], function(files) {
     gulp.src(['src/js/**/*.js', '!src/js/plugins/**/*.js'])
        .pipe(plumber({
            errorHandler: onError
          }))
        .pipe(jshint(jsHintConfig))
        .pipe(jshint.reporter('jshint-stylish'));
      gulp.start('scripts');
  });
});

gulp.task('watch:copy', function() {
  watch(['src/**/*.html'], function(files) {
    gulp.start('copy');
  });
});

gulp.task('watch:images', function() {
  watch(['src/img/**'], function(files) {
    gulp.start('images');
  });
});

gulp.task('watch:sass', function() {
  watch(['src/sass/**/*.scss'], function(files) {
    gulp.start('sassy');
  });
});

gulp.task('watch', ['watch:scripts','watch:copy','watch:images', 'watch:sass']);

gulp.task('clean:sass', function (cb) {
  del(['dist/css/**/*'], cb)
});

gulp.task('clean:images', function (cb) {
  del(['dist/img/**/*'], cb)
});

gulp.task('clean:scripts', function (cb) {
  del(['dist/js/**/*'], cb)
});

gulp.task('scripts', function() {
  var scripts = fs.readdirSync('./src/js').filter(function(n) {
    return fs.statSync('./src/js/' + n).isFile();
  }).map(function(n) {
    return browserify('./src/js/' + n)
    .bundle()
    .pipe(source(n.replace('.js', '') + '.min.js'))
    .pipe(gulpIf(shouldMinify, streamify(uglify())))
    .pipe(gulp.dest('dist/js'))
    .pipe(gulpIf(shouldWatch, livereload()));
    }); 
});

gulp.task('copy', function () {
  gulp.src(['src/*', '!src/js', '!src/sass'])
    .pipe(gulp.dest('./dist'));

  gulp.src(['src/elements/**/*.html'])
    .pipe(gulp.dest('./dist/elements'));

  gulp.src(['bower_components/**/*'])
    .pipe(gulp.dest('./dist/bower_components'))
    .pipe(gulpIf(shouldWatch, livereload()));
});
 
gulp.task('sassy', function() {
  gulp.src(['src/sass/**/*.scss'])
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(compass({
      config_file: './config.rb',
      css: './dist/css',
      sass: './src/sass',
      sourcemap: true
    }))
    .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
      }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(gulpIf(shouldWatch, livereload()));
});
 
gulp.task('images', ['clean:images'], function() {
  gulp.src(['src/img/**'])
    .pipe(gulp.dest('./dist/img'))
    .pipe(gulpIf(shouldWatch, livereload()));
});
 
gulp.task('serve', buildTasks, function() {
  nodemon({
    script: 'server.js'
  });
});

gulp.task('build', buildTasks, function() {});