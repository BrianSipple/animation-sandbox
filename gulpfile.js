/*global -$ */
'use strict';
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({lazy: true}),
    browserSync = require('browser-sync'),
    del = require('del'),
    path = require('path'),
    compose = require('./lib/compose'),
    reload = browserSync.reload,
    yargs = require('yargs').argv,
    config = require('./gulp-config')(),
    DEFAULT_PORT = process.env.PORT || config.defaultPort,
    paths = config.paths,


    log = function log(msg) {

        if (typeof msg === 'object') {
            for (var item in msg) {
                if (msg.hasOwnProperty(item)) {
                    $.util.log($.util.colors.blue(msg[item]));
                }
            }
        } else {
            $.util.log($.util.colors.blue(msg));
        }
    },

    notify = function notify (options) {

        var
            notifier = require('node-notifier'),

            notifyOptions = {
                sound: 'Bottle',
                contentImage: path.join(__dirname, 'apple-touch-icon.png'),
                icon: path.join(__dirname, 'apple-touch-icon.png')
            };
        compose(notifyOptions, options);

        notifier.notify(notifyOptions);

    },

    clean = function clean(path, done) {
        log('Cleaning: ' + $.util.colors.blue(path));
        del(path, done);
    },

    onChangeEvent = function onChangeEvent (ev) {
        var srcPattern = new RegExp('/.*(?=/' + paths.srcDirPath + ')/');
        log('File ' + ev.path.replace(srcPattern, '') + ' ' + event.type);
    },

    startBrowserSync = function startBrowserSync (isDev, isSpecRunner, isUsingNodemon) {

      if (yargs.noSync || browserSync.active) {
          return;
      }

      if (isUsingNodemon) {
          log('Configuring browsersync for use with nodemon');
      } else {
          log('Configuring browsersync for use without nodemon');
      }

      // vary selection based upon whether nodeMon is being used
      var browserSyncOpts = config.getBrowserSyncOpts(isDev, isSpecRunner, isUsingNodemon);

      log('Starting browser-sync on port ' + browserSyncOpts.port);

      if (isDev) {
          // Watch scss so that browserSync itself can watch the
          // compiled CSS in our temp dir
          gulp.watch([paths.srcSCSS], ['styles'])
              .on('change', onChangeEvent);
      } else {

          /**
           * If we're not in dev, make sure that we can watch all files,
           * and THEN run a response task (such as 'optimize'),
           * and THEN restart browsersync
           */
          gulp.watch([
                  paths.srcSCSS,
                  paths.srcJS,
                  paths.srcHTML
              ],
              ['optimize', reload]
         )
          .on('change', onChangeEvent);
      }

      browserSync(browserSyncOpts);

    },

    /**
     * Set up nodemon as the overarching process for our serving
     */
    runNodeServer = function runNodeServer (isDev) {

        var nodeMonOpts = {
            script: paths.nodeServerFilePath,
            delayTime: 1,
            env: {
                'PORT': DEFAULT_PORT,
                'NODE_ENV': isDev ? 'dev' : 'build'
            },
            watch: [paths.srcServerDirPath]
        };

        return $.nodemon(nodeMonOpts)
            .on('restart', function (ev) {
                log('*** nodemon restarted ***');
                log('Files changed on restart: \n' + ev);
                setTimeout(function () {
                    browserSync.notify('Reloading now ...');
                    browserSync.reload({ stream: false });
                }, config.browserReloadDelay);
            })
            .on('start', function () {
                log(' *** nodemon started *** ');
                startBrowserSync(isDev, isSpecRunner, true /* isUsingNodeMon */);
            })
            .on('crash', function () {
                log('*** nodemon has crashed: the script has failed ***');
            })
            .on('exit', function () {
                log('*** nodemon exited cleanly *** ');
            });
    },

    serve = function serve (isDev, isSpecRunner, isUsingNodemon) {

        if (isUsingNodemon) {
            runNodeServer();
        } else {

            // If we're not using nodemon, go straight to browsersync
            // (otherwise, or browserSync function is called as part
            // of nodemon's onStart function)
            startBrowserSync(isDev, isSpecRunner, false /* isUsingNodeMon */);
        }
    },

    startTest = function startTest (isSingleRun, done) {

        var
            // load karma here so that we only load it if we need it
            KarmaServer = require('karma').Server,

            // Setup a child process to handle running of tests that require a server
            child,
            fork = require('child_process').fork,
            excludeFiles = [],
            serverSpecs = config.serverIntegrationSpecs,


            onKarmaCompleted = function onKarmaCompleted (karmaResult) {
                log('Karma completed');

                // handle cases when we have a child process running
                if (child) {
                    log('Shutting down the child process');
                    child.kill();
                }

                // handle errors
                if (karmaResult === 1) {
                    done('karma: tests failed with code ' + karmaResult);

                } else {
                    done();
                }
            };

        if (yargs.startServers) {  // gulp test --startServers

            log('Starting server for tests');

            // before forking off the child process, set up the right ports
            var savedEnv = process.env;
            savedEnv.NODE_ENV = 'dev';
            savedEnv.PORT = config.integrationTestServerPort;

            child = fork(paths.nodeServerFilePath);

        } else {
            if (serverSpecs && serverSpecs.length) {
                excludeFiles = serverSpecs;
            }
        }

        new KarmaServer({
            configFile: config.karma.configFile,
            exclude: excludeFiles,
            singleRun: !!isSingleRun
        }, onKarmaCompleted).start();
    };


gulp.task('help', $.taskListing);

gulp.task('styles', ['clean-styles'], function () {

    log('Compiliing SCSS to CSS');

    return gulp
        .src(paths.srcSCSS, {base: paths.srcClientDirPath })
        //.pipe($.print())
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass(config.sassOpts))
        .pipe($.postcss([
            require('autoprefixer-core')({browsers: ['last 2 version', '> 5%']})
        ]))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(paths.tmpDirPath))
        //.pipe(gulp.dest(paths.distDirPath))
        .pipe(reload({stream: true}));

//        // move over any remaining CSS files (e.g normailize.css)
//        .pipe(gulp.src(paths.extraCSS, { base: paths.srcClientDirPath }))
//        .pipe(gulp.dest(paths.tmpDirPath))
//        //.pipe(gulp.dest(paths.distDirPath))
//        .pipe(reload({stream: true}));
});


gulp.task('clean', function (done) {
    var delConfig = [].concat(paths.distDirPath, paths.tmpDirPath);
    log('Cleaning ' + $.util.colors.blue(delConfig));
    del(delConfig, done);
});

gulp.task('clean-styles', function (done) {
    clean(paths.tmpDirPath + '/**/*.css', done);
});

gulp.task('clean-fonts', function (done) {
    clean(paths.distDirPath + 'fonts/**/*.*', done);
});

gulp.task('clean-images', function (done) {
    clean(paths.distDirPath + 'images/**/*.*', done);
});



gulp.task('vet', function () {

    log('Analyzing JavaScript files');

    return gulp
        .src(paths.vettedJS)
        .pipe($.if(yargs.verbose, $.print()))
        .pipe($.if(yargs.jscs, $.jscs()))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'), {verbose: true})
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});


gulp.task('scripts', ['vet'], function () {
    return gulp
        //.src(paths.srcJS)
        .src(paths.srcJS, { base: paths.srcClientDirPath })
        .pipe($.print())
        .pipe($.uglify())
        .pipe(gulp.dest(paths.tmpDirPath));
});



gulp.task('images', ['clean-images'], function () {
    return gulp
        //.src(paths.srcImages)
        .src(paths.srcImages, { base: paths.srcClientDirPath })
        .pipe($.cache($.imagemin(config.imageMinOpts)))
        .pipe(gulp.dest(paths.tmpDirPath))
        .pipe(gulp.dest(paths.distDirPath));
});


gulp.task('fonts', ['clean-fonts'], function () {
    return gulp
        //.src(paths.srcFonts)
        .src(paths.srcFonts, { base: paths.srcClientDirPath })
        .pipe(gulp.dest(paths.tmpDirPath))
        .pipe(gulp.dest(paths.distDirPath));
});


/**
 * SVG -> PNG fallback task
 */
gulp.task('svg2png', function () {
    return gulp
        .src(paths.srcSVGIcons, { base: paths.srcClientDirPath })
        .pipe($.svg2png())
        .pipe(gulp.dest(
            path.join(paths.distIcons, '/png/')
        ));
});

/**
 * Takes a bunch of separate SVGs and bundles them into one single
 * SVG file through the power of SVG symbols.
 */
gulp.task('svg-sprite', ['svg2png'], function () {
    return gulp
        .src(paths.srcSVGIcons, { base: paths.srcClientDirPath })
        .pipe($.svgSymbols(config.svgSymbolsOpts))
        .pipe(gulp.dest(paths.distIcons));
});



/**
 * Move vendor files to the distribution package
 */
gulp.task('vendor', function () {
    return gulp
        .src(paths.vendorSrc, {base: paths.srcClientDirPath, dot: true })
        .pipe(gulp.dest(paths.distDirPath));
});


gulp.task('extras', function () {
    return gulp
        .src([].concat(
                paths.rootExtras,
                paths.extraCSS
            ),
            {base: paths.srcClientDirPath, dot: true })
        .pipe(gulp.dest(paths.distDirPath));
});

gulp.task('clean', del.bind(null, [paths.distDirPath, paths.tmpDirPath]));



gulp.task('styles-watch', function () {
    gulp.watch([paths.srcSCSS], ['styles']);
});


gulp.task('watch', ['serve-dev'], function () {
    // watch for changes
    gulp.watch([
        paths.srcHTML,
        paths.srcJS,
        paths.srcImages,
        paths.srcFonts
    ]).on('change', function (ev) {
        onChangeEvent(ev);
        reload(ev);
    });

    gulp.watch(paths.srcSCSS, ['styles']).on('change', onChangeEvent);
    gulp.watch(paths.srcFonts, ['fonts']).on('change', onChangeEvent);
});


gulp.task('wiredep', function () {
    log('Wiring up bower css, and bower js into HTML');
    var
        wiredep = require('wiredep').stream,
        wireDepOpts = config.getWireDepOpts(),
        target = gulp.src(paths.srcIndexHTML, { base: paths.srcClientDirPath }),
        sources = gulp.src(
            paths.injectedCustomJS,
            {read: false, base: paths.srcClientDirPath }
        );

    //log('Paths: ' + paths.injectedCustomJS);

    return target
        .pipe(wiredep(wireDepOpts))
        .pipe($.inject(sources))
        .pipe($.print())
        .pipe(gulp.dest(paths.srcClientDirPath));
});


// inject bower components
gulp.task('inject', ['wiredep', 'styles'], function () {
    log('Injecting custom css and js into HTML... after calling wiredep');

    var target = gulp.src(paths.srcIndexHTML, { base: paths.srcClientDirPath }),
        sources = gulp.src(paths.injectedCustomCSS);

    return target.pipe($.inject(sources))
        //.pipe($.print())
        .pipe(gulp.dest(paths.srcClientDirPath));
});



/**
 * Optimze files that are sent to our build index.html
 *
 * gulp-useref will look for comments in the sourced
 * index.html telling it 1) what files to bundle and
 * 2) where to place (how to name) said bundled file
 * in the build folder.
 */
gulp.task('optimize', ['inject'/*, 'test'*/], function () {

    log('Optimizing the JS, CSS, and HTML files');

    var
        assets = $.useref.assets({searchPath: ['./']});
        //templateCache = paths.tmpDirPath + config.templateCacheOpts.file;


    return gulp
        .src(paths.srcIndexHTML)
        .pipe($.plumber())
//        .pipe($.inject(gulp.src(templateCache, {read: false}), {
//        starttag: '<!-- inject:templates:js -->'
//    }))
        .pipe(assets)

        /**
         * conditionally apply portions of the pipeline to separate,
         * appropriate tasks based upon a RegEx for their file type
         * (Note how this also avoids the need for separate .restores() at each step)
         */
        .pipe($.if('**/*.js', $.uglify()))
        .pipe($.if('**/*.css', $.csso()))
        .pipe($.rev())  // app.js --> app-1j88842bs.js
        .pipe(assets.restore())
        .pipe($.useref())

        /* Point index.html to the proper rev'd files */
        .pipe($.revReplace())
        .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
        .pipe(gulp.dest(paths.distDirPath))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(paths.distDirPath));
});




/**
 * Bump the version
 *
 * ```--type=pre``` will bump the prerelease version *.*.*-x
 * ```--type=patch``` or no flag will bump the patch version
 * ```--type=minor``` will bump the minor release version *.x.*
 * ```--type=major``` will bump the major verison x.*.*
 * ```--version=1.2.3``` will bump to an exact version, and ignore all other flags
 */
gulp.task('bump', function () {

    var
        msg = 'Bumping versions',
        type = yargs.type,
        version = yargs.version,
        options = {};

    if (version) {
        options.version = version;
        msg += ' to ' + version;

    } else {
        options.type = type;
        msg += ' for a ' + type;
    }
    log(msg);

    return gulp
        .src(paths.packages)
        .pipe($.bump(options))
        .pipe(gulp.dest(paths.rootPath));
});


gulp.task('serve-dev', ['inject'], function () {
    startBrowserSync(true /* isDev */);
});


gulp.task('serve-build', ['build'], function () {
   startBrowserSync(false /* isDev */);
});


gulp.task('build-specs', /*['templatecache'],*/ function () {
    log('Building the spec runner');

    var
        wiredep = require('wiredep').stream,
        options = config.getWireDepOpts();

    return gulp
        .src(paths.specRunnerFilePath)
        .pipe(wiredep(options))

        // Inject test files
        .pipe($.inject(
            gulp.src(paths.testLibraries),
            { name: 'inject:testlibraries', read: false }
        ))

        // Inject JS files
        .pipe($.inject(gulp.src(paths.srcJS)))

        // inject spec helpers
        .pipe($.inject(
            gulp.src(paths.specHelpers),
            { name: 'inject:spechelpers', read: false }
        ))

        // Inject spec files
        .pipe($.inject(
            gulp.src(paths.specFiles),
            { name: 'inject:specs', read: false }
        ))

//        // Inject templatecache template
//        .pipe($.inject(
//            gulp.src(paths.tmpDirPath + config.templateCache.file),
//            { name: 'inject:templates', read: false }
//        )
//
        .pipe(gulp.dest(paths.srcClientDirPath));
});


gulp.task('serve-specs', ['build-specs'], function (done) {

    log('Running the spec runner');
    serve(true /* isDev */, true /* isSpecRunner */, false /* isUsingNodemon */);

    done();
});

gulp.task('run-node-devserver', function (done) {
  runNodeServer(true);
  done();
});


gulp.task('test', ['vet' /*, 'templatecache'*/], function (done) {
   startTest(true /*singleRun */, done);
});

gulp.task('autotest', ['vet' /*, 'templatecache'*/], function (done) {
   startTest(false /*singleRun */, done);
});



gulp.task('build', ['optimize', 'fonts', 'images', 'extras', 'vendor'], function () {
    log('Building everything!');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Running gulp serve-build'
    };

    //del(paths.tmpDirPath);
    log(msg);
    notify(msg);

    return gulp.src(paths.distDirPath + '/**/*').pipe($.size({title: 'build', gzip: true}));
});


gulp.task('default', ['clean'], function () {
    gulp.start('build');
});




/**
 * Helper function to start the node server with Nodemon (when using node instead of browsersync for activating and serving)
 * @param {[[Type]]} isDev [[Description]]
 */
//function serve(isDev) {
//    // For node, start nodemon here
//}
