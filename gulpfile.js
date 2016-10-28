var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


var paths = {
  sass: ['./scss/**/*.scss'],
  scripts: [
  './scripts/*.js',
  './scripts/**/*.js',
  './scripts/**/*.*.js',
],
libs: [
]
};

gulp.task('default', ['sass', 'libs', 'scripts']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('scripts', function(done) {
  gulp.src(paths.scripts)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./www/js/'))
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./www/js/'))
    .on('end', done);
});

gulp.task('libs', function(done) {
  gulp.src(paths.libs)
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('./www/js/'))
    .pipe(rename('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./www/js/'))
    .on('end', done);
});


gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.libs, ['libs']);
});


gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
