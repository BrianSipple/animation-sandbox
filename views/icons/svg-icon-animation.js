import WandIcon from './models/wand-icon';

let app = function app () {

  let init = function init () {

    let
      SELECTORS = {
        iconGridContainer: '.grid',
        iconsRootSVG: '.grid__svg-container',
      },

      SVG_METADATA = {
        wand1: {
          id: '#WandIcon1',
          obj: WandIcon(document.querySelector('#WandIcon1')),
          tlLabel: 'wand-icon-1-animating'
        },
        wand2: {
          id: '#WandIcon2',
          obj: WandIcon(document.querySelector('#WandIcon2')),
          tlLabel: 'wand-icon-2-animating'
        }
      },

      EASINGS = {

      },

      LABELS = {
        wandIcon: 'wand-icon-animating'
      },

      // Cache a direct mapping from svg ids to their correspoinding objects
      // that we can quickly reference during event handling
      idToIconObjectMap = {},

      masterTL,

      iconGridContainerElem =
        document.querySelector(SELECTORS.iconGridContainer),

      /**
       * Cache icon objects based on their id and sync their timelines
       * with the masterTL.
       */
      wireUpIcons = function wireUpIcons () {
        //debugger;

        masterTL = new TimelineMax();

        let
          iconObj,
          iconMetaData,
          iconOpts = {};

        Object.keys(SVG_METADATA).forEach((metaDataKey) => {

          iconMetaData = SVG_METADATA[metaDataKey];
          iconObj = iconMetaData.obj;

          iconOpts = {
            id: iconMetaData.id,
            masterTL: masterTL,
            tlLabel: iconMetaData.tlLabel
          };

          iconObj.init(iconOpts);
          idToIconObjectMap[iconMetaData.id] = iconObj; // cache here for quicker access on click
        });
      },

      showIcons = function showIcons () {
        document.querySelector(SELECTORS.iconsRootSVG).style.opacity = '1';
      }

    wireUpIcons();
    showIcons();

  };

  return init;

};

export default app;
