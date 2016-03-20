/* */ 
const
    gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    config = require(gulpConfigPath)(),
    opts = config.opts.postcss,
    paths = config.paths;


/**
 * Watch with browserSync and live reloading
 */
gulp.task('watch', ['serve'], function () {
    browserSync.init(opts.browserSync);

    gulp.watch(
        paths.srcCSS,
        ['build:temp', browserSync.reload]
    );
});
