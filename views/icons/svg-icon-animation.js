//import WandIcon from './models/wand-icon';
import SVG_METADATA from './svg-metadata';

let app = function app () {

  let init = function init () {

    let
      SELECTORS = {
        iconGridContainer: '.grid',
        iconsRootSVG: '.svg-grid-container',
      },

      // Cache a direct mapping from svg ids to their correspoinding objects
      // that we can quickly reference during event handling
      idToIconObjectMap = {},

      iconGridContainerElem =
        document.querySelector(SELECTORS.iconGridContainer),

      /**
       * Cache icon objects based on their id and sync their timelines
       * with the masterTL.
       */
      wireUpIcons = function wireUpIcons () {
        //debugger;
        let
          iconObj,
          iconMetaData,
          iconParams = {};

        Object.keys(SVG_METADATA).forEach((metaDataKey) => {

          iconMetaData = SVG_METADATA[metaDataKey];
          iconObj = iconMetaData.obj;

          iconParams = {
            id: iconMetaData.id,
            customClickHandlers: iconMetaData.customClickHandlers
          };

          iconObj.init(iconParams);
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
