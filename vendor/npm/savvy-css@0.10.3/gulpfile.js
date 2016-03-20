/* */ 
(function(process) {
  'use strict';
  const gulp = require('gulp'),
      path = require('path'),
      requireDir = require('require-dir'),
      notify = require('gulp-notify'),
      util = require('gulp-util');
  global.log = function log(msg) {
    if (typeof(msg) === 'object') {
      for (var item in msg) {
        if (msg.hasOwnProperty(item)) {
          util.log(util.colors.blue(msg[item]));
        }
      }
    } else {
      util.log(util.colors.blue(msg));
    }
  };
  global.gulpErrorHandler = function gulpErrorHandler(error, data) {
    data = data || {};
    let notifyOpts = {
      title: data.title || 'Gulp Error',
      message: data.message || 'Check your console',
      sound: 'Sosumi'
    };
    notify.onError(notifyOpts)(error);
    log(error.stack);
    this.emit('end');
  };
  global.gulpConfigPath = path.join(__dirname, 'gulpfile.config.js');
  requireDir('./gulp', {recurse: false});
  gulp.task('default', ['build:dist']);
})(require('process'));
