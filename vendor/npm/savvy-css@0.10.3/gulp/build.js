/* */ 
(function(process) {
  const gulp = require('gulp'),
      plumber = require('gulp-plumber'),
      size = require('gulp-size'),
      postcss = require('gulp-postcss'),
      rename = require('gulp-rename'),
      sourcemaps = require('gulp-sourcemaps'),
      config = require(gulpConfigPath)(),
      opts = config.opts.postcss,
      paths = config.paths,
      processors = [require('postcss-import')(), require('postcss-nested')(), require('postcss-focus')(), require('postcss-media-variables')(), require('postcss-css-variables')(), require('postcss-custom-media')(), require('postcss-custom-properties')(), require('postcss-calc')(), require('postcss-media-variables')(), require('postcss-cssnext')(), require('autoprefixer')(opts.autoprefixer), require('css-mqpacker')(), require('csswring')(opts.cssWring), require('postcss-reporter')()];
  gulp.task('build:temp', ['clean:temp'], function() {
    log('Building for temporary local serving');
    return gulp.src(paths.mainSrcCSSFile).pipe(sourcemaps.init()).pipe(plumber({errorHandler: global.gulpErrorHandler})).pipe(postcss(processors)).pipe(sourcemaps.write('.')).pipe(gulp.dest(paths.tempDir));
  });
  gulp.task('build:dist', ['clean:dist'], function() {
    log('Building for distribution');
    return gulp.src(paths.mainSrcCSSFile).pipe(plumber({errorHandler: global.gulpErrorHandler})).pipe(postcss(processors)).pipe(rename({suffix: '.min'})).pipe(size({showFiles: true})).pipe(size({
      gzip: true,
      showFiles: true
    })).pipe(gulp.dest(paths.distDir));
  });
})(require('process'));
