const gulp  = require('gulp');
const del   = require('del');
const babel = require('gulp-babel-compile');


/**
 * Build sources into `dist` folder
 */
gulp.task('build', () => {
  // remove previous build
  del.sync(['./dist']);

  // copy `bin` scripts to `dist` folder
  gulp
  .src('./bin/*')
  .pipe(gulp.dest('./dist/bin'))

  // compile src with Babel and put it into `dist` folder
  return gulp
    .src('./lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./dist/lib'))
})
