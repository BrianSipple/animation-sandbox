import WandIcon from './models/wand-icon';

let app = function app () {

  let init = function init () {

    let
      SELECTORS = {
        iconGridContainer: '.grid',
        iconsRootSVG: '.grid__svg-container',
        wandIconSVG: '#WandIcon'
      },

      idToIconMap = {},

      EASINGS = {

      },

      LABELS = {
        wandIcon: 'wand-icon-animating'
      },

      wandIcon,

      masterTL,

      iconGridContainerElem =
        document.querySelector(SELECTORS.iconGridContainer),

      handleIconClick = function handleIconClick (ev) {
        debugger;
        let clickedEl = ev.target;

        if (clickedEl.id && idToIconMap.hasOwnProperty(clickedEl.id)) {
          idToIconMap[clickedEl.id].handleClick();
        }
      },

      _wireUpIcon = function _wireUpIcon (iconObj, id, svgElem, label) {
        let opts = {
          id: id,
          svgElem: svgElem,
          masterTL: masterTL,
          tlLabel: label
        };
        iconObj.init(opts);
      },

      /**
       * Cache icon objects based on their id and sync their timelines
       * with the masterTL.
       */
      wireUpIcons = function wireUpIcons () {
        //debugger;

        masterTL = new TimelineMax();

        wandIcon = WandIcon();
        _wireUpIcon(
          wandIcon,
          SELECTORS.wandIconSVG,
          document.querySelector(SELECTORS.wandIconSVG),
          LABELS.wandIcon
        );

        idToIconMap[SELECTORS.wandIconSVG] = wandIcon;
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
