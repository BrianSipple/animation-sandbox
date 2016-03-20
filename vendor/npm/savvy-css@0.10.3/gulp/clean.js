/* */ 
'use strict';

const
	gulp = require('gulp'),
	del = require('del'),
    config = require(global.gulpConfigPath)(),
	paths = config.paths;

gulp.task('clean:dist', function (done) {
	log('Cleaning');
	return del([].concat(paths.distDir + '*'));
});


gulp.task('clean:temp', function (done) {
	log('Cleaning');
	return del([].concat(paths.tempDir + '*'));
});
