/* */ 
const path = require('path'),
    stylelintConfig = require('./stylelint.config'),
    pngquant = require('imagemin-pngquant'),
    NAMES = {
      rootDir: '',
      assetsDir: 'assets',
      srcDir: 'src',
      distDir: 'dist',
      tempDir: 'temp',
      mainCSSFile: 'savvy'
    },
    rootDirPath = path.join(__dirname, NAMES.rootDir),
    srcDirPath = path.join(rootDirPath, NAMES.srcDir),
    tempDirPath = path.join(rootDirPath, NAMES.tempDir),
    distDirPath = path.join(rootDirPath, NAMES.distDir),
    assetsDirPath = path.join(rootDirPath, NAMES.assetsDir),
    makeResolver = function(root) {
      return function(glob) {
        glob = glob || '';
        return path.join(root, glob);
      };
    },
    resolveToSrc = makeResolver(srcDirPath),
    resolveToAssets = makeResolver(assetsDirPath),
    resolveToDist = makeResolver(distDirPath);
function GulpConfig() {
  'use strict';
  const paths = {
    rootDir: rootDirPath,
    srcDir: srcDirPath,
    assetsDir: assetsDirPath,
    tempDir: tempDirPath,
    distDir: distDirPath,
    srcCSS: [resolveToSrc('/**/*.css')],
    mainSrcCSSFile: resolveToSrc(`${NAMES.mainCSSFile}.css`),
    configFiles: {npm: path.join(rootDirPath, 'package.json')},
    srcImages: [resolveToAssets('img/*')],
    packageConfigFiles: [path.join(rootDirPath, 'package.json')]
  },
      opts = {
        postcss: {
          autoprefixer: {browsers: ['last 2 versions', 'ie 9', 'Android 4']},
          stylelint: {configFile: path.join(rootDirPath, 'stylelint.config.js')},
          reporter: {clearMessages: true},
          precss: {
            'nested': {},
            'mixins': {},
            'selector-not': {},
            'import': {}
          },
          cssNano: {discardComments: {removeAll: true}},
          cssWring: {removeAllComments: true}
        },
        browserSync: {
          proxy: 'localhost',
          logPrefix: 'SAVVY CSS',
          notify: false
        },
        getImageMinOpts: function() {
          return {
            progressive: true,
            use: [pngquant()]
          };
        }
      };
  return {
    paths,
    opts
  };
}
module.exports = GulpConfig;
