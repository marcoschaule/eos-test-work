(function() {
'use strict';

// *****************************************************************************
// Imports
// *****************************************************************************

const del             = require('del');
const path            = require('path');
const runSequence     = require('run-sequence');
const gulp            = require('gulp');
const concat          = require('gulp-concat');
const twig            = require('gulp-twig');
const less            = require('gulp-less');
const htmlmin         = require('gulp-htmlmin');
const autoprefixer    = require('gulp-autoprefixer');
const uglify          = require('gulp-uglify');
const cssnano         = require('gulp-cssnano');
const nodemon         = require('gulp-nodemon');
const livereload      = require('gulp-livereload');

// *****************************************************************************
// Locals
// *****************************************************************************

const _strPathSrc             = './src';
const _strPathDist            = './dist';
const _strPathAssets          = './assets';
const _strFileNameStylesProd  = 'styles.min.js';
const _strFileNameScriptsProd = 'scripts.min.js';
const _objLiveReload          = { port: 9091, host: '0.0.0.0' };

// array of style files in the expected order
const _arrFilesStyleDev = [
  'styles/common.less',
  'styles/hacks.less',
];

// array of script files in the expected order
const _arrFilesScriptDev = [
  'scripts/common.js',
];

// *****************************************************************************
// Tasks
// *****************************************************************************

// clean task
gulp.task('clean', _clean);

// development task
gulp.task('dev', callback => runSequence(
  ['clean'],
  ['templates:dev',  'styles:dev',  'scripts:dev'],
  ['assets'],
  ['watch:dev'],
  callback));

// production task
gulp.task('prod', callback => runSequence(
  ['clean'],
  ['templates:prod', 'styles:prod', 'scripts:prod'],
  ['assets'],
  ['watch:prod'],
  callback));

// *****************************************************************************
// Helpers
// *****************************************************************************

/**
 * Helper function to clean all files in dist folder.
 *
 * @private
 */
function _clean() {
  return del([ path.join(__dirname, `${_strPathDist}/**/*`) ], { force: true });
}

// *****************************************************************************

/**
 * Helper function to build template files for development.
 *
 * @private
 */
function _templatesDev() {
  const objData = { data: {
    mixFilesStyle : _arrFilesStyleDev.map(_renameLessFile),
    mixFilesScript: _arrFilesScriptDev,
  } };

  return gulp
    .src(`${_strPathSrc}/templates/**/[^_]*.twig`)
    .pipe(twig(objData))
    .pipe(gulp.dest(_strPathDist))
    .pipe(livereload(_objLiveReload))
    ;
}
gulp.task('templates:dev', _templatesDev);

// *****************************************************************************

/**
 * Helper function to build template files for production.
 *
 * @private
 */
function _templatesProd() {
  const objData = { data: {
    mixFilesStyle : [_strFileNameStylesProd],
    mixFilesScript: [_strFileNameScriptsProd],
  } };

  return gulp
    .src(`${_strPathSrc}/templates/**/[^_]*.twig`)
    .pipe(twig(objData))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(_strPathDist))
    .pipe(livereload(_objLiveReload))
    ;
}
gulp.task('templates:prod', _templatesProd);

// *****************************************************************************

/**
 * Helper function to build style files for development.
 *
 * @private
 */
function _stylesDev() {
  return gulp
    .src(_arrFilesStyleDev.map(strFilePathName => `${_strPathSrc}/${strFilePathName}`))
    .pipe(less())
    .pipe(autoprefixer({ browsers: ['last 5 versions'], cascade: false }))
    .pipe(gulp.dest(`${_strPathDist}/styles`))
    .pipe(livereload(_objLiveReload))
    ;
}
gulp.task('styles:dev', _stylesDev);

// *****************************************************************************

/**
 * Helper function to build style files for production.
 *
 * @private
 */
function _stylesProd() {
  return gulp
    .src(_arrFilesStyleDev.map(strFilePathName => `${_strPathSrc}/${strFilePathName}`))
    .pipe(less())
    .pipe(autoprefixer({ browsers: ['last 5 versions'], cascade: false }))
    .pipe(concat('styles.min.js'), { newLine: '' })
    .pipe(gulp.dest(`${_strPathDist}`))
    .pipe(livereload(_objLiveReload))
    ;
}
gulp.task('styles:prod', _stylesProd);

// *****************************************************************************

/**
 * Helper function to build script files for development.
 *
 * @private
 */
function _scriptsDev() {
  return gulp
    .src(_arrFilesScriptDev.map(strFilePathName => `${_strPathSrc}/${strFilePathName}`))
    .pipe(gulp.dest(`${_strPathDist}/scripts`))
    .pipe(livereload(_objLiveReload))
    ;
}
gulp.task('scripts:dev', _scriptsDev);

// *****************************************************************************

/**
 * Helper function to build script files for production.
 *
 * @private
 */
function _scriptsProd() {
  return gulp
    .src(_arrFilesScriptDev.map(strFilePathName => `${_strPathSrc}/${strFilePathName}`))
    .pipe(uglify())
    .pipe(concat('scripts.min.js'), { newLine: '' })
    .pipe(gulp.dest(`${_strPathDist}`))
    .pipe(livereload(_objLiveReload))
    ;
}
gulp.task('scripts:prod', _scriptsProd);

// *****************************************************************************

/**
 * Helper function to copy the assets
 *
 * @private
 */
function _assets() {
  return gulp
    .src(`${_strPathAssets}/**`)
    .pipe(gulp.dest(`${_strPathDist}`))
    .pipe(livereload(_objLiveReload))
    ;
}
gulp.task('assets', _assets);

// *****************************************************************************

/**
 * Helper function to watch files in development mode.
 *
 * @private
 */
function _watchDev() {
  livereload.listen();
  gulp.watch(`${_strPathSrc}/styles/**/*.less`,    ['styles:dev']);
  gulp.watch(`${_strPathSrc}/scripts/**/*.js`,     ['scripts:dev']);
  gulp.watch(`${_strPathSrc}/templates/**/*.twig`, ['templates:dev']);
  gulp.watch(`${_strPathAssets}/**/*.*`,           ['assets']);
}
gulp.task('watch:dev', _watchDev);

// *****************************************************************************

/**
 * Helper function to watch files in production mode.
 *
 * @private
 */
function _watchProd() {
  livereload.listen();
  gulp.watch(`${_strPathSrc}/styles/**/*.less`,    ['styles:prod']);
  gulp.watch(`${_strPathSrc}/scripts/**/*.js`,     ['scripts:prod']);
  gulp.watch(`${_strPathSrc}/templates/**/*.twig`, ['templates:prod']);
  gulp.watch(`${_strPathAssets}/**/*.*`,           ['assets']);
}
gulp.task('watch:prod', _watchProd);

// *****************************************************************************

/**
 * Helper function to rename less files.
 *
 * @private
 */
function _renameLessFile(strFileName) {
  return strFileName.replace(/\.less$/, '.css');
}

// *****************************************************************************

})();