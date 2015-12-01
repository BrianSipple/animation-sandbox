/**
 * This file wires up SVG icon objects with the DOM selectors that
 * we want to provide them with, and organizes everything into a
 * "metadata" object. Our main application file can then just import the object.
 */

//import AntennaWiggleIcon from './effects/antenna-wiggle-icon';
import ControllerToTvMorphObject from './effects/controller-to-tv-morph/main';
import ControllerToTvFlashMorphObject from './effects/controller-to-tv-morph-and-flash/main';
import AntennaWiggleObject from './effects/antenna-wiggle/main';
import ControllerToTvMorphAndDrawObject from './effects/controller-to-tv-morph-logo-draw/main';

import CONSTANTS from './constants/constants';


const SvgObjects = {

    controllerToTvMorph: {
        id: '#controller-to-tv-morph',
        obj: ControllerToTvMorphObject(document.querySelector('#controller-to-tv-morph'))
    },

    controllerToTvMorphAndFlash: {
        id: '#controller-to-tv-morph-and-flash',
        obj: ControllerToTvFlashMorphObject(
            document.querySelector('#controller-to-tv-morph-and-flash'),
            {
                finishType: CONSTANTS.FILTER_EFFECTS.TV_FINISHES.NONE,
                filterIds: {
                    pointLightFilter: '#filter__point-light-glow--1'
                }
            }
        ),
    },

    controllerToTvMorphAndFlashWithGlowFinish: {
        id: '#controller-to-tv-morph-and-flash-with-glow-finish',
        obj: ControllerToTvFlashMorphObject(
            document.querySelector('#controller-to-tv-morph-and-flash-with-glow-finish'),
            {
                finishType: CONSTANTS.FILTER_EFFECTS.TV_FINISHES.LOGO_GLOW,
                filterIds: {
                    pointLightFilter: '#filter__point-light-glow--2',
                    gaussianGlowFilter: '#filter__gaussian-glow--1',
                }
            }
        ),
    },

    antennaWiggle1: {
        id: '#antenna-wiggle--1',
        obj: AntennaWiggleObject(
            document.querySelector('#antenna-wiggle--1'),
            {
                wiggleEffect: CONSTANTS.ANTENNA_WIGGLES.STRETCH
            }
        )
    },

    ControllerToTvMorphAndDraw: {
        id: '#controller-to-tv-morph-logo-draw',
        obj: ControllerToTvMorphAndDrawObject(document.querySelector('#controller-to-tv-morph-logo-draw'))
    },

};

export default SvgObjects;
