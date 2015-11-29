/**
 * This file wires up SVG icon objects with the DOM selectors that
 * we want to provide them with, and organizes everything into a
 * "metadata" object. Our main application file can then just import the object.
 */

//import AntennaWiggleIcon from './models/antenna-wiggle-icon';
import ControllerToTvMorphObject from './models/controller-to-tv-morph';
import ControllerToTvFlashMorphObject from './models/controller-to-tv-morph-and-flash';
import AntennaWiggleObject from './models/antenna-wiggle';
import ControllerToTvMorphAndDrawObject from './models/controller-to-tv-morph-logo-draw';


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
                preserveFiltering: false,
                filterIds: {
                    pointLightFilter: '#filter__point-light-glow--1'                }
            }
        ),
    },

    controllerToTvMorphAndFlashWithGlowFinish: {
        id: '#controller-to-tv-morph-and-flash-with-glow-finish',
        obj: ControllerToTvFlashMorphObject(
            document.querySelector('#controller-to-tv-morph-and-flash-with-glow-finish'),
            {
                preserveFiltering: true,
                filterIds: {
                    pointLightFilter: '#filter__point-light-glow--2',
                    gaussianGlowFilter: '#filter__gaussian-glow--1',
                }
            }
        ),
    },

    antennaWiggle: {
        id: '#antenna-wiggle',
        obj: AntennaWiggleObject(document.querySelector('#antenna-wiggle'))
    },

    ControllerToTvMorphAndDraw: {
        id: '#controller-to-tv-morph-logo-draw',
        obj: ControllerToTvMorphAndDrawObject(document.querySelector('#controller-to-tv-morph-logo-draw'))
    },

};

export default SvgObjects;
