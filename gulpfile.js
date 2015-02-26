var pkg = require('./package.json')
var gulp = require('gulp')
var jshint = require('gulp-jshint')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var replace = require('gulp-replace')
var mocha = require('gulp-mocha-phantomjs')
var zip = require('gulp-zip')

var src = 'src/jquery.analytics.js'
var dist = 'dist/'
var tests = './test/browser.html'

function test (shouldExit) {
  var pipeline = gulp.src(tests)

  pipeline.pipe(mocha({
    reporter: 'spec'
  }))

  if (shouldExit) {
    return pipeline.on('finish', function () {
      setTimeout(function () {
        process.exit(0)
      }, 2000);
    })
  }

  return pipeline
}

gulp.task('build', ['clean'], function () {
  return gulp.src(src)
    .pipe(replace(/\@LICENSE/g, pkg.license))
    .pipe(replace(/\@VERSION/g, pkg.version))
    .pipe(replace(/\@DATE/g, new Date().toString()))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dist + 'js'))
})

gulp.task('archive', function () {
  return gulp.src(dist + '**/*')
    .pipe(zip(pkg.name + '-v' + pkg.version + '-dist.zip'))
    .pipe(gulp.dest('dist'))
})

gulp.task('tests', ['lint'], function () {
  return test()
})

gulp.task('lint', function () {
  return gulp.src(src)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('clean', ['tests'], function (next) {
  require('del')([dist], next)
})

gulp.task('default', ['build'])

gulp.task('test', ['lint'], function () {
  return test(true)
})