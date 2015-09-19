module.exports = function () {
    'use strict';

    var path = require('path'),

        // Names... soon to be wired up with paths
        srcDirName = './',
        rootDirName = './',
        distDirName = 'dist',
        tmpDirName = '.tmp',
        reportDirName = 'report',
        specRunnerFileName = 'specs.html',

        rootDirPath = path.join(__dirname, './'),
        srcDirPath = path.join(__dirname, srcDirName),
        tmpDirPath = path.join(__dirname, tmpDirName),
        distDirPath = path.join(__dirname, distDirName),

        wiredep = require('wiredep'),
        bowerFiles = wiredep(
            {
                devDependencies: true,
                //directory: path.join(__dirname, 'vendor/')
            }
        ).js,

        defaultPort = 9988,


        /**
         * helper method to generate resolver functions from
         * a specified base root
         */
        makeRootResolver = function makeRootResolver (root) {
            return function rootResolver (glob) {
                glob = glob || '';
                return path.join(root, glob);
            };
        },

        resolveToSrc = makeRootResolver(srcDirPath),
        resolveToTmp = makeRootResolver(tmpDirPath),
        resolveToTmpApp = makeRootResolver(path.join(tmpDirPath, 'app')),
        resolveToSrcJS = makeRootResolver(path.join(srcDirPath, 'js')),
        resolveToSrcStyles = makeRootResolver(path.join(srcDirPath, 'styles')),
        resolveToSrcViews = makeRootResolver(path.join(srcDirPath, 'views')),
        resolveToDistDir = makeRootResolver(distDirPath),

        resolveToSrcAssets = makeRootResolver(path.join(srcDirPath, 'assets')),


        srcIndexHTML = path.join(srcDirPath, 'index.html'),

        config = {
            distDirName: distDirName,
            tmpDirName: tmpDirName,
            srcDirName: srcDirName,
        };

    config.paths = {
        srcIndexHTML: srcIndexHTML,
        srcImages: resolveToSrcAssets('images/**/*.{gif,jpg,png,svg}'),

        ////// Path names //////
        distDirPath: distDirPath,
        srcDirPath: srcDirPath,

        // dist Path names //
        distAssets: path.join(distDirPath, 'assets'),
        distIcons: path.join(distDirPath, 'assets/icons'),

        rootPath: rootDirPath,

        bower: {
            json: path.join(__dirname, './bower.json'),
            directory: path.join(__dirname, './vendor/')
        },


        // Packages to source when bumping package versions
        packages: [
            root + 'package.json',
            root + 'bower.json'
        ],

        // all of the JS that we want to vet
        vettedJS: [
            resolveToSrcJS('**/*.js'),
            '!./jspm.config.js',
            '!./karma.conf.js',
            '!./gulp-config.js',
            './*.js'  // vet our own top-level JS files such as gulpfile.js
        ],

        srcJS: [
            resolveToSrcAssets('/scripts/**/*.js'),
            resolveToSrcJS('**/*.js'),
            '!' + resolveToSrcJS('/**/*.spec.js')
        ],

        srcSCSS: [
            resolveToSrcStyles('/**/*.scss'),
            resolveToSrcAssets('styles/**/*.scss')
        ],

        srcHTML: [
            resolveToSrcViews('**/*.html'),
            srcIndexHTML
        ],

        srcFonts: [
            path.join(resolveToSrcAssets('fonts'), '**/*.{eot,svg,ttf,woff,woff2}')
        ],

        srcSVGIcons: path.join(resolveToSrcAssets('svg/icons/**/*.svg')),

        // Any CSS files that we might just want to move
        //around without processing (e.g. normalize.css)
        extraCSS: [
            resolveToSrcStyles('*.css'),
            resolveToSrcAssets('styles/**/*.css')
        ],

        // Extra config and dotfiles in the root (e.g, robots.txt)
        // that we just want to move around
        rootExtras: [
            resolveToSrc('*.*'),
            '!' + resolveToSrc('*.html')
        ],


        ///// Custom HTML Injects (CAREFUL: Order MIGHT matter here) //////

        /* Inject CSS after it has been compiled to .tmp */
        injectedCustomCSS: [
            //resolveToTmpAssets('styles/normalize.css'),
            resolveToTmpApp('main.css')
        ],

        injectedCustomJS: [
            path.join(__dirname, 'vendor', 'modernizr/modernizr.js'),
            resolveToSrcAssets('scripts/base-plugins.js'),
            path.join(__dirname, 'vendor', 'gsap/BezierPlugin.min.js'),
            path.join(__dirname, 'vendor', 'gsap/TweenMax.min.js'),
            resolveToSrcJS('*.js'),
            '!' + resolveToSrc('/**/*.spec.js')
        ],

        specFiles: path.join(srcDirPath, '**/*.spec.js'),

        specRunnerFilePath: path.join(
            srcDirPath,
            specRunnerFileName
        ),

        specHelpers: path.join(
            srcDirPath,
            'test-helpers/*.js'
        ),

        /**
         * Paths to libraries needed for running tests
         * (Injected into mocha spec runner template)
         */
        testLibraries: [
            'node_modules/mocha/mocha.js',
            'node_modules/chai/chai.js',
            'node_modules/sinon-chai/lib/sinon-chai.js'
        ]


    };

    config.defaultPort = defaultPort;
    config.sassOpts = {
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.'],
        onError: console.error.bind(console, 'Sass error: ')
    };

    config.imageMinOpts = {
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs -- we want them
        // as hooks for embedding and styling
        svgoPlugins: [{cleanupIDs: false}],
        optimizationLevel: 4
    };

    config.svgSymbolsOpts = {
        className: '.icon--%f',
        svgoConfig: {

        }  // TODO: Add options here. For now, I'm using SVGOMG
    };


    config.injectCSSSourceOpts = {
        read: false,
        cwd: path.join(__dirname, srcDirPath)
    };


    config.browserReloadDelay = 1000; // ms

    /**
     * Karma config settings
     */
    config.karma = getKarmaFiles();


    /**
     * Karama AND general testing settings
     */
    config.serverIntegrationSpecs = [
        path.join(
            config.paths.srcDirPath,
            'tests/server-integration/**/*.spec.js'
        )
    ];

    /**
     * Use a different port for the forked process that any
     * integration tests will run on
     */
    config.integrationTestServerPort = defaultPort + 1;

    config.getWireDepOpts = function getWiredepOpts() {
        var options = {
            bowerJson: require(config.paths.bower.json),
            directory: config.paths.bower.directory,
            ignorePath: '../..'
        };
        return options;
    };

    config.getBrowserSyncOpts = function getBrowserSyncOpts (isDev, isSpecRunner, isUsingNodeMon) {

        // Default options across all varities of browserSyncing
        var options = {
            notify: isUsingNodeMon ? true : false,
            port: isUsingNodeMon ? 3000 : 3001,
            ghostMode: {
                clicks: true,
                location: false,
                forms: true,
                scroll: true
            },
            injectChanges: true,   // inject just the file that changed
            logFileChanges: true,
            logLevel: 'debug',
            logPrefix: 'portfolio-source-files',
            reloadDelay: config.browserReloadDelay
        };


        // Depending on whether or not we're using nodemon, our browsersync
        // task will either run with a proxy or set up its own server
        if (isUsingNodeMon) {

            // proxy the default port on the port browsersync is using
            options.proxy = 'localhost:' + defaultPort;

            options.files = isDev ?
                [
                    srcDirPath + '/**/*.*',
                    '!' + config.paths.srcSCSS,
                    // catch changes to css as its built to .tmp
                    config.paths.tmpDirPath + '/**/*.css'
                ] :
                // in build mode, we'll have watched first,
                // and we don't want to watch here
                [];
        } else {
            options.server = {
                baseDir: [config.paths.tmpDirPath, config.paths.srcClientDirPath],
                routes: {
                    '/vendor': 'vendor'
                }
            };
        }

        if (isSpecRunner) {
            options.startPath = specRunnerFileName;
        }

        return options;
    };

    return config;

    function getKarmaFiles () {

        var options = {

            // TODO: config is still undefined when this function runs, so I think trying to use it in the "files" array needs to be fixed
            files: [].concat(
                bowerFiles,
                //config.specHelpers,
                //path.join(__dirname, clientDirName, '/**/*.module.js'),
                resolveToSrcJS('**/*.js'),
                resolveToSrcAssets('scripts/**/*.js'),
                //path.join(__dirname, tmpDirName, config.templateCache.file),
                config.serverIntegrationSpecs
            ),
            exclude: [].concat(
                config.serverIntegrationSpecs
            ),
            coverage: {
                dir: path.join(__dirname, reportDirName, 'coverage'),
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'}
                ]
            },
            preprocessors: {},
            configFile: __dirname + '/karma.conf.js'
        };

        // anywhere in the clientAppDir, ignore the spec files, but get all other JS
        options.preprocessors[path.join(__dirname, 'js', '/**/!(*.spec)+(.js)')] = ['coverage'];

        return options;
    }

};
