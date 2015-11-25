import SvgObjects from './svg-objects';

const app = (function () {

    const
        SELECTORS = {
            gridContainer: '.grid-container',
        },

        // Cache a direct mapping from svg ids to their correspoinding objects
        // that we can quickly reference during event handling
        idToObjectMap = {},

        gridContainerElem = document.querySelector(SELECTORS.gridContainer);

    /**
    * Cache icon objects based on their id and sync their timelines
    * with the masterTL.
    */
    function wireUpGridObjects () {
        let
            svgObj,
            objParams = {};

        for (let svgObjData of Object.values(SvgObjects)) {
            let
                svgObj = svgObjData.obj;

                objParams = {
                    id: svgObjData.id,
                    customClickHandlers: svgObjData.customClickHandlers
                };

            svgObj.init(objParams);
            idToObjectMap[svgObjData.id] = svgObj; // cache here for quicker access on click
        }
    };

    function showGrid () {
        gridContainerElem.style.opacity = '1';
        gridContainerElem.style.visibility = 'visible';
    }


    function init () {
        wireUpGridObjects();
        showGrid();
    }

    init();

}());

export default app;
