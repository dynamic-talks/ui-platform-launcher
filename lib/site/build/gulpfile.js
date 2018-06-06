const path = require('path');
const gulp = require('gulp');
const git = require('git-rev');
const gutil = require('gulp-util');
const clean = require('gulp-clean');
const babel = require('gulp-babel-compile');
const gulpsync = require('gulp-sync')(gulp);
const webpack = require('webpack');
const zip = require('gulp-zip');

const {
  DIST_FOLDER_PATH,
  ROOT_DIR
} = require('./build-params');
const pjson = require(path.resolve(ROOT_DIR, 'package.json'));
const webpackConfig = require('./webpack/webpack.config');


gulp.task('default', ['prod']);

gulp.task('prod',gulpsync.sync([
  'clean',
  'build-backend',
  'build-frontend',
  'generate-version-file',
  'generate-launch-params-file'
]));

gulp.task('clean-dev', function () {
  return gulp.src('./public/build').pipe(clean());
});

gulp.task('clean-prod', () => {
  return gulp.src('./dist').pipe(clean());
});

gulp.task('clean', [
  'clean-prod',
  'clean-dev'
]);

gulp.task('build-frontend', () => {
  webpack(webpackConfig).run();
});

gulp.task('build-backend', () => {
  gulp.src([
    './package*.json',
  ]).pipe(gulp.dest(DIST_FOLDER_PATH));

  gulp.src([
    './src/ui/**/*.js',
    '!./src/ui/**/*.test.js'
  ])
    .pipe(babel())
    .pipe(gulp.dest(`${DIST_FOLDER_PATH}/src/ui`));

  gulp.src([
    './src/core/**/*.js',
    '!./src/core/**/*.test.js'
  ])
    .pipe(babel())
    .pipe(gulp.dest(`${DIST_FOLDER_PATH}/src/core`));

  gulp.src([
    './webpack/manifest-config.js',
  ])
    .pipe(gulp.dest(`${DIST_FOLDER_PATH}/webpack`));

  gulp.src([
    './bin/*.js'
  ])
    .pipe(babel())
    .pipe(gulp.dest(`${DIST_FOLDER_PATH}/bin`));

  // Copy config files to dist
  gulp.src([
    './config/*.{yaml,json}'
  ]).pipe(gulp.dest(`${DIST_FOLDER_PATH}/config`));
});

gulp.task('generate-version-file', () => {
  return git.short((sha1) => {
    string_src('VERSION', `${pjson.version}-${sha1}`)
      .pipe(gulp.dest(`${DIST_FOLDER_PATH}/`));
  });
});



gulp.task('generate-launch-params-file', () => {
  const launchParams = {
    configPath: process.env.APP_CONFIG_PATH,
  };

  string_src('LAUNCH_PARAMS', JSON.stringify(launchParams))
    .pipe(gulp.dest(`${DIST_FOLDER_PATH}/`));
});



gulp.task('zip', function () {
  return gulp
    .src([
      DIST_FOLDER_PATH
    ])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'));
});

function string_src(filename, string) {
  const src = require('stream').Readable({ objectMode: true });

  src._read = function () {
    this.push(new gutil.File({
      cwd: '',
      base: '',
      path: filename,
      contents: new Buffer(string)
    }));
    this.push(null);
  };

  return src;
}

module.exports = {
  gulp,
  gulpsync,
  gulpUtil: gutil,
  gulpClean: clean,
  gulpZip: zip,
  gulpBabelCompile: babel,
  gitRev: git,
  webpack
};
