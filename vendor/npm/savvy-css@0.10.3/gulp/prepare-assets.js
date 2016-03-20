/* */ 
'use strict';

const
	gulp = require('gulp'),
	args = require('yargs').argv,
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),

	config = require(global.gulpConfigPath)(),
	paths = config.paths,
  opts = config.opts;


gulp.task('imagemin', function () {

  return gulp
    .src(paths.srcImages)
    .pipe(imagemin(opts.getImageMinOpts()))
    //.pipe(gulp.dest(paths.assetsDir));
    .pipe(gulp.dest(paths.tempDir));
});


gulp.task('assets', ['imagemin']);
