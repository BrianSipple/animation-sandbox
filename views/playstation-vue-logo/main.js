import SvgObjects from './svg-objects';

const app = (function () {

    const
        SELECTORS = {
            iconGridContainer: '.grid',
            iconsRootSVG: '.svg-grid-container',
        },

        // Cache a direct mapping from svg ids to their correspoinding objects
        // that we can quickly reference during event handling
        idToIconObjectMap = {},

        iconGridContainerElem = document.querySelector(SELECTORS.iconGridContainer);

    /**
    * Cache icon objects based on their id and sync their timelines
    * with the masterTL.
    */
    function wireUpIcons () {
        let
            iconObj,
            iconMetaData,
            iconParams = {};

        for (let svgObjData of Object.values(SvgObjects)) {
            let
                iconObj = svgObjData.obj;

                iconParams = {
                    id: svgObjData.id,
                    customClickHandlers: svgObjData.customClickHandlers
                };

            iconObj.init(iconParams);
            idToIconObjectMap[svgObjData.id] = iconObj; // cache here for quicker access on click
        }
    };

    function showIcons () {
        document.querySelector(SELECTORS.iconsRootSVG).style.opacity = '1';
    }


    function init () {
        wireUpIcons();
        showIcons();
    }

    init();

}());

export default app;
