/* */ 
'use strict';
const gulp = require('gulp'),
    args = require('yargs').argv,
    bump = require('gulp-bump'),
    git = require('gulp-git'),
    filter = require('gulp-filter'),
    tagVersion = require('gulp-tag-version'),
    StreamTransform = require('stream').Transform,
    config = require(global.gulpConfigPath)(),
    paths = config.paths;
function cb(func) {
  var stream = new StreamTransform({objectMode: true});
  stream._transform = function stealthExecuteInStream(file, unused, callback) {
    func();
    callback(null, file);
  };
  return stream;
}
gulp.task('bump-version', ['build:dist'], function() {
  var msg = 'Bumping version',
      type = args.type,
      version = args.version,
      options = {};
  if (version) {
    options.version = version;
    msg += ' to ' + version;
  } else {
    options.type = type;
    msg += ' for a ' + type;
  }
  log(msg);
  gulp.src(paths.packageConfigFiles).pipe(bump(options)).pipe(gulp.dest(paths.rootDir)).pipe(git.commit('Package Version bumped')).pipe(filter(paths.configFiles.npm)).pipe(tagVersion());
});
gulp.task('push-tag', function() {
  var remote = args.remote || 'brian';
  var branch = args.branch || 'master';
  git.push(remote, branch, {args: '--tags'}, function onGitPushError(err) {
    if (err) {
      throw err;
    }
  });
});
